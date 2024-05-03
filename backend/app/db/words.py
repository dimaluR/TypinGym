import random
from app import basedir
from collections import defaultdict

DICT_ENG_5K = basedir / "app/db/dict/english5k.txt"


_missed = set()
_word_list = []
_words_by_lead = defaultdict(list)
_words_by_len = defaultdict(list)
_words_by_letter = defaultdict(list)


def get_missed_words(n_words: int, repeats: int):
    words = [_missed.pop() for _ in range(min(len(_missed), n_words))] * repeats
    # logging.info(f"words: {words}")
    return words


def clear_words():
    _word_list = []
    _words_by_lead = defaultdict(list)
    _words_by_len = defaultdict(list)
    _words_by_letter = defaultdict(list)


def get_random_word():
    return random.sample(_word_list, 1)[0]


def update_dictionary():
    with DICT_ENG_5K.open("r") as f:
        clear_words()
        for _word in f.readlines():
            word = _word.strip("\n").lower()
            _word_list.append(word)
            _words_by_lead[word[0]].append(word)
            _words_by_len[len(word)].append(word)
            for letter in _word:
                _words_by_letter[letter].append(word)


def capitalize_word(word: str):
    return word.capitalize()


update_dictionary()
