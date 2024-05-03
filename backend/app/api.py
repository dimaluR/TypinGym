import logging
import random
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import db, word_processor
from app.models import CompletedWordData

app = FastAPI()

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def base():
    return "welcome to the word engine... vroom!"


@app.get("/word")
def get_word() -> str:
    return db.words.get_random_word()


@app.get("/words")
def get_words(n: int, user_id: str | None) -> list[str]:
    words = []
    _config = db.firebase.get_user_config(user_id) if user_id else db.firebase.get_default_config()  # maybe some caching is in order here...
    letter_penalties = [(letter, letter_stats.penalty) for letter, letter_stats in db.symbols._letters.items()]
    letters, penalties = list(zip(*letter_penalties))
    ls = random.choices(letters, penalties, k=n)
    words = [random.sample(db.words._words_by_letter[letter], k=1)[0] for letter in ls]
    logging.info(words)
    words = [db.symbols.apply_modifier(word, db.words.capitalize_word, _config["capitalize"]) for word in words]
    words = [db.symbols.apply_modifier(word, db.symbols.surround_word, _config["surround"]) for word in words]
    words = [db.symbols.apply_modifier(word, db.symbols.add_punctuation, _config["punctuation"]) for word in words]
    logging.info(sorted({(symbol, p.penalty) for symbol, p in db.symbols._punctuations.items()}, key=lambda p: p[1], reverse=True))
    logging.info(sorted({(symbol, s.penalty) for symbol, s in db.symbols._surrounds.items()}, key=lambda s: s[1], reverse=True))
    logging.info(sorted({(symbol, s.penalty) for symbol, s in db.symbols._letters.items()}, key=lambda s: s[1], reverse=True))
    logging.info(f"{words=}")
    return words


@app.post("/word/completed")
def post_completed_word_data(data: CompletedWordData) -> None:
    word_processor._word_queue.put(data)


@app.get("/stats/letters")
def get_stats_letters() -> list[dict]:
    return [letter.as_dict() for letter in db.symbols._letters.values()]
