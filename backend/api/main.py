from collections import defaultdict
import logging
from random import randint

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
    with open('./backend/api/dict/english1k.txt', 'r') as f:
        for _word in f.readlines():
            word = _word.strip('\n')
            _word_list.append(word)
            _words_by_lead[word[0]].append(word)

@app.get("/word")
def get_word() -> str:
    return _word_list[randint(0, len(_word_list) - 1)]

def _init():
    fill_words()


_init()

if __name__ == "__main__":
    uvicorn.run(app, port=5007)
