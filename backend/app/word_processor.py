import logging
from threading import Thread
from queue import Queue
from typing import Hashable, Iterable

from app.models import CompletedWordData, LetterData
from app import db

_word_queue = Queue()


def handle_surrounds_letter(letter: LetterData):
    for s in db.symbols._surrounds:
        if letter.letter in s:
            handle_letter_group(letter, db.symbols._surrounds, s, db.symbols.SURROUNDS_PENALTY_FACTOR)


def handle_letter_group(letter: LetterData, group: Iterable, member: Hashable, penalty: int):
    group[member].hits += 1
    group[member].durations.append(letter.duration)
    if letter.miss:
        group[member].misses += 1
        group[member].penalty += penalty
    elif group[member].penalty > 1:
        group[member].penalty -= 1


def handle_completed_punctuation(letter: LetterData):
    if letter.letter in db.symbols.SURROUNDS_LETTERS:
        handle_surrounds_letter(letter)
    handle_letter_group(letter, db.symbols._punctuations, letter.letter, db.symbols.PUNCTUATION_PENALTY_FACTOR)

def map_special_keys_to_characters(letter: LetterData):
    special_keys_mapping = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
    }
    letter.letter = special_keys_mapping.get(letter.letter, letter.letter)


def preprocess_letter(letter: LetterData):
    map_special_keys_to_characters(letter)


def handle_queued_words():
    while True:
        word_data = _word_queue.get()
        handle_completed_word_data(word_data)
        _word_queue.task_done()


def handle_completed_word_data(data: CompletedWordData) -> None:
    for letter in data.word_letters_data:  # first letter should be treated a bit differently...
        preprocess_letter(letter)
        if letter.letter in db.symbols._punctuations:
            handle_completed_punctuation(letter)
            continue
        char = letter.letter.lower()
        handle_letter_group(letter, db.symbols._letters, char, db.symbols.LETTER_PENALTY)


t = Thread(target=handle_queued_words, daemon=True)
logging.info("starting word processos thread...")
t.start()
