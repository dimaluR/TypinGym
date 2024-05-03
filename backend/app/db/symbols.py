from dataclasses import dataclass, field
import itertools
import random
import string
from typing import Callable

SURROUNDS = [("(", ")"), ("[", "]"), ("{", "}"), ("<", ">"), ("</", ">"), ('"', '"'), ("'", "'")]
SURROUNDS_LETTERS = list(itertools.chain.from_iterable(SURROUNDS))
SURROUNDS_PENALTY_FACTOR = 4
PUNCTUATION_PENALTY_FACTOR = 6
LETTER_PENALTY = 6


@dataclass
class SymbolStats:
    misses: int = field(default=1)
    hits: int = field(default=0)
    penalty: int = field(default=1)
    durations: list = field(default_factory=list)

    @property
    def total(self):
        return self.misses + self.hits

    @property
    def hit_rate(self):
        return self.misses / self.total


def surround_word(word: str):
    surround_penalty = [(surrounds, s.penalty) for surrounds, s in _surrounds.items()]
    surrounds, penalty = list(zip(*surround_penalty))
    s = random.choices(surrounds, penalty, k=1)[0]
    return s[0] + word + s[1]


def add_punctuation(word: str):
    punctuation_penalty = [(symbol, p.penalty) for symbol, p in _punctuations.items()]
    punctuation, penalty = list(zip(*punctuation_penalty))
    p = random.choices(punctuation, penalty, k=2)
    return p[0] + word + p[1]


def apply_modifier(word: str, modifier: Callable, p: int):
    if p == 0:
        return word
    return modifier(word) if random.random() < 1 / p else word


_letters = {char: SymbolStats() for char in string.ascii_lowercase}
_punctuations = {p: SymbolStats() for p in string.punctuation}
_surrounds = {s: SymbolStats() for s in SURROUNDS}
