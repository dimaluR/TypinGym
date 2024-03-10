import random
from collections import defaultdict
from pathlib import Path

import uvicorn
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
GUTNEBER_PATH = Path.cwd()
DICT_ENG_1K = GUTNEBER_PATH / "backend/api/dict/english1k.txt"
assert DICT_ENG_1K.exists()

class WordData(BaseModel):
    word: str


class CompletedWordData(BaseModel):
    word_count: int
    duration: int

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_word_list = []
_words_by_lead = defaultdict(list)
_words_by_len = defaultdict(list)
_missed = set()


def fill_words():
    with DICT_ENG_1K.open("r") as f:
        for _word in f.readlines():
            word = _word.strip("\n")
            _word_list.append(word)
            _words_by_lead[word[0]].append(word)
            _words_by_len[len(word)].append(word)


def get_random_word():
    return random.sample(_word_list, 1)[0]


@app.get("/word")
def get_word() -> str:
    return get_random_word()


@app.get("/words")
def get_words(n: int) -> list[str]:
    repeats = 2
    missed_to_pop = min(len(_missed), n // repeats)
    missed = [_missed.pop() for _ in range(missed_to_pop)] * repeats
    words = missed + random.sample(_word_list, n - len(missed))
    random.shuffle(words)
    return words

@app.post("/word/incorrect")
def post_misspelled_word(data: WordData) -> None:
    _missed.add(data.word)

_wpm = 0

def update_wpm(word_count, duration_ms):
    global _wpm
    _wpm = word_count / (duration_ms / 60_000) #FIX: Global use... blahhh

@app.post("/word/completed")
def post_completed_word_data(data: CompletedWordData) ->None:
    update_wpm(data.word_count, data.duration)

@app.get("/line")
def get_line(length: int) -> list[str]:
    line_length = 0
    words = []
    while True:
        word = get_random_word()
        if line_length + len(word) < length:
            line_length += len(word) + 1
            words.append(word)
        else:
            rem = length - line_length + 1
            if rem:
                words.append(random.sample(_words_by_len[rem], 1)[0])
            break
    return words

@app.get("/stats")
def get_stats():
    return {"wpm": f"{_wpm:02.0f}"}

def _init():
    fill_words()


_init()

if __name__ == "__main__":
    uvicorn.run(app, port=5007)
