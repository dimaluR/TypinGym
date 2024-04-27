import * as auth from "./auth.js";
import sendRequestToBackend from "../backend_gateway.js";
const INITIAL_WORD_COUND = 6;
export const TOTAL_WORDS_ON_UPDATE = 4;

export const SPACER_CHAR = "\u00a0";
export const RETYPE_CHAR = "↰";
export const MODIFIER_KEYS = ["Control", "Alt", "Shift", "Meta", "Tab", "Escape"];

const content = document.getElementById("content");
export let currentWordIndex = 0;
export let currentLetterIndex = 0;


export async function setCurrentIndexesToNextLetter(currentWordLength) {
    currentLetterIndex++;
    if (currentLetterIndex >= currentWordLength) {
        currentLetterIndex = 0;
        currentWordIndex++;
    }
}

export function setCurrentIndexesToPreviousLetter() {
    const contentElement = document.getElementById("content");
    currentLetterIndex--;
    if (currentLetterIndex < 0) {
        if (currentWordIndex === 0) {
            currentWordIndex = 0;
            currentLetterIndex = 0;
        } else {
            currentWordIndex--;
            currentLetterIndex = contentElement.children[currentWordIndex].children.length - 1;
        }
    }
}

function createLetterElement(letter) {
    const letterElement = document.createElement("letter");
    letterElement.className = "letter";
    letterElement.textContent = letter;
    letterElement.duration = 1;
    return letterElement;
}

async function createWordElement(word) {
    const wordElement = document.createElement("div");
    wordElement.className = "word";
    wordElement.word = word;
    for (const letter of word) {
        const letterElement = createLetterElement(letter);
        wordElement.appendChild(letterElement);
    }
    wordElement.appendChild(createLetterElement(SPACER_CHAR));
    return wordElement;
}

export async function resetWordsInContent() {
    content.innerHTML = "";
    currentWordIndex = 0;
    currentLetterIndex = 0;

    await addWordsToContent(INITIAL_WORD_COUND);
}

async function getNewWordsByCount(wordCount) {
    const user_id = auth.isUserSignedIn() ? auth.getCurrentUserId() : "default";
    const route = `words?n=${wordCount}&user_id=${user_id}`;
    console.log(route);
    try {
        const words = await sendRequestToBackend(route);
        console.log(`added new words: [${words}].`);
        return words;
    } catch (error) {
        console.error(`${error}`);
    }
}

export async function addWordsToContent(wordCount) {
    let words;
    try {
        words = await getNewWordsByCount(wordCount);
    } catch (error) {
        console.error(`error fetching words: ${error}`);
    }
    for (const word of words) {
        const wordElement = await createWordElement(word);
        content.appendChild(wordElement);
    }
}
