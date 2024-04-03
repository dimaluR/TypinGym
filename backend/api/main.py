import logging
import math
import random
from collections import defaultdict
from pathlib import Path
import statistics
import string
from typing import Callable
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
GUTNEBER_PATH = Path.cwd()
DICT_ENG_1K = GUTNEBER_PATH / "backend/api/dict/english1k.txt"
assert DICT_ENG_1K.exists()
DICT_ENG_5K = GUTNEBER_PATH / "backend/api/dict/english5k.txt"
assert DICT_ENG_5K.exists()

MAX_ALLOWED_LETTER_DURATION = 1 / (20 * 5.1 / 60000)  # equivalent to 20 WPM
DURATION_MOVING_AVERAGE_NUM = 50
_wpm = 0

_config = {
    "capitalize_freq": 0,
    "surround_freq": 0,
    "punctuation_freq": 0,
    "force_retype": False,
    "stop_on_word": False,
    "max_word_length": 6,
}
SURROUNDS = [("(", ")"), ("[", "]"), ("{", "}"), ("<", ">"), ("</", ">"), ('"', '"'), ("'", "'")]


class WordData(BaseModel):
    word: str


class LetterData(BaseModel):
    letter: str
    duration: int
    miss: bool


class CompletedWordData(BaseModel):
    word_count: int
    duration: int
    word_letters_data: list[LetterData]


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
_words_by_letter = defaultdict(list)
_missed = set()


def clear_words():
    global _word_list, _words_by_lead, _words_by_len, _words_by_letter
    _word_list = []
    _words_by_lead = defaultdict(list)
    _words_by_len = defaultdict(list)
    _words_by_letter = defaultdict(list)


_punctuations = {
    p: {
        "misses": 0,
        "hits": 1,
        "durations": [],
    }
    for p in string.punctuation
}

_surrounds = {
    surrounds: {
        "misses": 0,
        "hits": 1,
        "durations": [],
    }
    for surrounds in SURROUNDS
}


class LetterStats:
    def __init__(self, char: str):
        self.char = char
        self.durations = []
        self.miss_count = 0
        self.duration_moving_averages = []
        self.error_freq = 0

    def add_duration(self, duration: int):
        if duration < MAX_ALLOWED_LETTER_DURATION:
            self.durations.append(duration)
            self.calc_duration_moving_average()
            self.update_error_frequency()

    def calc_duration_moving_average(self):
        mean = self.get_average_duration()
        self.duration_moving_averages.append(mean)
        self.duration_moving_averages = self.duration_moving_averages[:DURATION_MOVING_AVERAGE_NUM]

    def add_miss(self):
        self.miss_count += 1

    def get_average_duration(self):
        return statistics.mean(self.durations[:DURATION_MOVING_AVERAGE_NUM]) if self.durations else None

    def update_error_frequency(self):
        if self.miss_count == 0:
            return
        self.error_freq = math.floor(len(self.durations) / self.miss_count)

    def as_dict(self):
        return {
            "letter": self.char,
            "durations": self.durations,
            "duration_moving_averages": self.duration_moving_averages,
            "mean": self.get_average_duration(),
            "miss": self.miss_count,
            "error_freq": self.error_freq,
            "occurances": len(self.durations),
        }


_letters: dict[str, LetterStats] = {char: LetterStats(char) for char in string.ascii_lowercase}
_letter_by_occurances = dict.fromkeys(string.ascii_lowercase, 0)
_letter_by_error_freq = dict.fromkeys(string.ascii_lowercase, 0)


def update_letter_by_occurance(char: str):
    global _letter_by_occurances
    _letter_by_occurances[char] = len(_letters[char].durations)
    _letter_by_occurances = dict(sorted(_letter_by_occurances.items(), key=lambda t: t[1]))


def update_letter_by_error_freq(char: str):
    global _letter_by_error_freq
    _letter_by_error_freq[char] = _letters[char].error_freq
    _letter_by_error_freq = dict(sorted(_letter_by_error_freq.items(), key=lambda t: t[1]))


def fill_words():
    with DICT_ENG_5K.open("r") as f:
        clear_words()
        for _word in f.readlines():
            word = _word.strip("\n").lower()
            if len(word) > _config["max_word_length"]:
                continue
            _word_list.append(word)
            _words_by_lead[word[0]].append(word)
            _words_by_len[len(word)].append(word)
            for letter in _word:
                _words_by_letter[letter].append(word)
    logging.info(f"{_config=}")


def get_random_word():
    return random.sample(_word_list, 1)[0]


def least_used_letter_words(num_words, words_per_letter=2):
    words_to_add = []
    for letter, occurances in _letter_by_occurances.items():
        if num_words <= 0:
            break
        letter_words = random.sample(_words_by_letter[letter], min(num_words, words_per_letter))
        words_to_add.extend(letter_words)
        logging.info(f"{letter=}: {occurances=}, {letter_words}")
        num_words -= min(words_per_letter, num_words)
    return words_to_add


def freq_error_letters(num_words, words_per_letter=1):
    words_to_add = []
    for letter, error_freq in _letter_by_error_freq.items():
        if num_words <= 0:
            break
        if error_freq == 0:
            continue
        letter_words = random.sample(_words_by_letter[letter], min(num_words, words_per_letter))
        words_to_add.extend(letter_words)
        logging.info(f"{letter=}: {error_freq=}, {letter_words}")
        num_words -= min(words_per_letter, num_words)
    return words_to_add


@app.get("/word")
def get_word() -> str:
    return get_random_word()


def get_missed_words(n_words: int, repeats: int):
    words = [_missed.pop() for _ in range(min(len(_missed), n_words))] * repeats
    logging.info(f"words: {words}")
    return words


def capitalize_word(word: str):
    return word.capitalize()


def surround_word(word: str):
    weights = [s["misses"] / s["hits"] or 0.25 for s in _surrounds.values()]
    surrounds = list(_surrounds)
    s = random.choices(surrounds, weights, k=1)[0]
    logging.info(f"surrounds: {list(zip(surrounds, weights))}")
    logging.info(f"s: {s}")
    return s[0] + word + s[1]


def add_punctuation(word: str):
    weights = [p["misses"] / p["hits"] or 0.25 for p in _punctuations.values()]
    symbols = list(_punctuations)
    logging.info(f"punc: {list(zip(symbols, weights))}")
    p = random.choices(symbols, weights, k=2)
    return p[0] + word + p[1]


def apply_modifier(word: str, modifier: Callable, p: int):
    if p == 0:
        return word
    return modifier(word) if random.random() < 1 / p else word


@app.get("/words")
def get_words(n: int) -> list[str]:
    m = n - 2
    max_error_words = 2
    words = get_missed_words(n_words=2, repeats=2)
    logging.info(f"missed words: {words}")
    error_words_count = min((n - len(words)), 2)
    words.extend(freq_error_letters(error_words_count, 2))
    least_used_letter_words_count = min(n - len(words), m - max_error_words)
    words.extend(least_used_letter_words(least_used_letter_words_count))
    words.extend(random.sample(_word_list, n - len(words)))
    random.shuffle(words)
    words = [apply_modifier(word, capitalize_word, _config["capitalize_freq"]) for word in words]
    words = [apply_modifier(word, surround_word, _config["surround_freq"]) for word in words]
    words = [apply_modifier(word, add_punctuation, _config["punctuation_freq"]) for word in words]
    logging.info(f"{words=}")
    return words


@app.get("/config")
def get_config() -> dict:
    return _config


@app.post("/config")
def post_config(data: dict[str, int]):
    logging.info(f"recieved config update {data}")
    for key, value in data.items():
        logging.info(f"setting config: [{key}]: {value}")
        _config.update({key: value})
        match key:
            case "max_word_length":
                logging.info(f"getting new words on len <= {value}")
                fill_words()


@app.post("/word/incorrect")
def post_misspelled_word(data: WordData) -> None:
    _missed.add(data.word)


def update_wpm(word_count, duration_ms):
    global _wpm
    _wpm = word_count / (duration_ms / 60_000)  # FIX: Global use... blahhh


def handle_completed_punctuation(letter: LetterData):
    for surrounds in _surrounds:
        (open_bracket, close_bracket) = surrounds
        if letter.letter in open_bracket or letter.letter in close_bracket:
            _surrounds[surrounds]["hits"] += 1
            _surrounds[surrounds]["durations"].append(letter.duration)
            if letter.miss:
                _surrounds[surrounds]["misses"] += 1
    _punctuations[letter.letter]["hits"] += 1
    _punctuations[letter.letter]["durations"].append(letter.duration)
    if letter.miss:
        _punctuations[letter.letter]["misses"] += 1


def map_special_keys_to_characters(letter: LetterData):
    match letter.letter:
        case "&amp;":
            letter.letter = "&"
        case "&lt;":
            letter.letter = "<"
        case "&gt;":
            letter.letter = ">"


@app.post("/word/completed")
def post_completed_word_data(data: CompletedWordData) -> None:
    update_wpm(data.word_count, data.duration)
    for letter in data.word_letters_data:
        char = letter.letter
        map_special_keys_to_characters(letter)
        if letter.letter in _punctuations:
            handle_completed_punctuation(letter)
            continue
        if char.isupper():
            char = letter.letter.lower()
        _letters[char].add_duration(letter.duration)
        if letter.miss:
            _letters[char].add_miss()
        update_letter_by_occurance(char)
        update_letter_by_error_freq(char)


@app.get("/stats")
def get_stats():
    return {"wpm": f"{_wpm:02.0f}"}


@app.get("/stats/letters")
def get_stats_letters() -> list[dict]:
    return [letter.as_dict() for letter in _letters.values()]


def _init():
    fill_words()


_init()

if __name__ == "__main__":
    uvicorn.run(app, port=5007)
