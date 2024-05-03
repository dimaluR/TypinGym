from pydantic import BaseModel


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
