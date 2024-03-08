from collections import defaultdict
from pathlib import Path
import random

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

DICT_ENG_1K = "./backend/api/dict/english1k.txt"
dict_path = Path(DICT_ENG_1K)

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


def fill_words():
    with dict_path.open("r") as f:
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
    return [get_random_word() for _ in range(n)]


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


def _init():
    fill_words()


_init()

if __name__ == "__main__":
    uvicorn.run(app, port=5007)
