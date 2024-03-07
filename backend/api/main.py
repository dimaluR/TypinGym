from collections import defaultdict
import logging
from pathlib import Path
from random import randint

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


def fill_words():
    with dict_path.open("r") as f:
        for _word in f.readlines():
            word = _word.strip("\n")
            _word_list.append(word)
            _words_by_lead[word[0]].append(word)


def get_random_word():
    return _word_list[randint(0, len(_word_list) - 1)]


@app.get("/word")
def get_word() -> str:
    return get_random_word()


@app.get("/words")
def get_words(n: int) -> list[str]:
    return [get_random_word() for _ in range(n)]

@app.get("/line")
def get_line(length: int) ->list[str]:
    line_length = 0
    words = []
    while True:
        word = get_random_word()
        line_length += len(word) + 1
        if line_length < length:
            words.append(word)
        else:
            break
    return words


def _init():
    fill_words()


_init()

if __name__ == "__main__":
    uvicorn.run(app, port=5007)
