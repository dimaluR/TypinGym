import { initializeApp } from "firebase/app"
import sendRequestToBackend from "./backend_gateway.js";
import { authUser } from "./auth.js";
const SPACER_CHAR = "\u00a0";
const RETYPE_CHAR = "↰";
const INITIAL_WORD_COUND = 16;
const TOTAL_WORDS_ON_UPDATE = 8;
const MODIFIER_KEYS = ["Control", "Alt", "Shift", "Meta", "Tab", "Escape"];
const content = document.getElementById("content");

const firebaseConfig = {
  apiKey: "AIzaSyDJ8Kx6f_f6uHFwhTRLA3fGKG_QGjN4ESE",
  authDomain: "typingym-85269.firebaseapp.com",
  projectId: "typingym-85269",
  storageBucket: "typingym-85269.appspot.com",
  messagingSenderId: "417546758951",
  appId: "1:417546758951:web:3f8a3251556dde83299702",
  measurementId: "G-FNMEX2KZFC"
};
const app = initializeApp(firebaseConfig)
authUser(app)
// cursor keeps track of the furthest position reached.
let cursor = 0;
let maxCursor = 0;
let maxWord = 0;

// track the current active text elements
let currentWord;
let currentLetter;

let currentWordIndex;
let currentLetterIndex;

// keep track of the word time start;
let wordTimeStart = null;
let letterTimeStart = null;

let _config = {};

// main function
main();

// sliders
const sp = document.getElementById("sp");
const menu = document.getElementById("menu");

function initCheckboxInput(checkboxElementId, updateValue) {
    const checkboxElement = document.getElementById(checkboxElementId);
    checkboxElement.checked = _config[updateValue];
    checkboxElement.oninput = async function () {
        console.log(`updating ${checkboxElementId} value with ${this.checked}`);
        _config[updateValue] = this.checked;
        await updateConfig();
        await resetWordsInContent();
    };
    return checkboxElement;
}
function initSliderElement(sliderElementId, updateValue) {
    const sliderElement = document.getElementById(sliderElementId);
    sliderElement.value = _config[updateValue] > 0 ? 11 - _config[updateValue] : 0;
    let lastSliderUpdateTime = Date.now();
    sliderElement.oninput = async (event) => {
        const configSliderValue = event.target.value > 0 ? 11 - event.target.value : 0;
        if (configSliderValue != _config[updateValue]) {
            console.log(`upadating ${updateValue} with ${configSliderValue}, event target value ${event.target.value}`);
            lastSliderUpdateTime = Date.now();
            _config[updateValue] = configSliderValue;
            await updateConfig();
            await resetWordsInContent();
        }
    };
}

const forceRetypeCheckbox = initCheckboxInput("force_retype_checkbox", "force_retype");
const stopOnWordCheckBox = initCheckboxInput("stop_on_word_checkbox", "stop_on_word");
initSliderElement("capitalFreqSlider", "capitalize_freq");
initSliderElement("surroundFreqSlider", "surround_freq");
initSliderElement("punctuationFreqSlider", "punctuation_freq");
initSliderElement("maxWordLengthSlider", "max_word_length");
//
content.onmouseover = function () {
    content.style.cursor = "none";
    sp.style.opacity = 0;
    sp.style.transition = "opacity .2s";

    menu.style.opacity = 0;
    menu.style.transition = "opacity .2s";
};

content.onmouseleave = function () {
    sp.style.opacity = 1;
    sp.style.transition = "opacity .2s";

    menu.style.opacity = 1;
    menu.style.transition = "opacity .2s";
};

function clearTypedClassesFromLetter(letter) {
    letter.classList.remove("correct", "incorrect", "typed");
}

async function handleKeyDownEvent(event) {
    {
        clearTypedClassesFromLetter(currentLetter);
        if (MODIFIER_KEYS.includes(event.key)) {
            if (event.key === "Escape") {
                resetWordsInContent();
            }
            console.log(`modifier key pressed: ${event.key}`);
        } else if (event.code === "Backspace") {
            setCurrentIndexesToPreviousLetter();
            updateActiveElements();
            letterTimeStart = Date.now();

            currentLetter.classList.add("backtrack");
            cursor--;
            if (
                currentWord.nextElementSibling.offsetLeft === content.offsetLeft &&
                currentLetter === currentWord.children[currentWord.children.length - 1]
            ) {
                scrollContentToCenterWord();
            }
        } else {
            Array.from(currentWord.children).forEach((letter) => letter.classList.remove("fix"));
            currentLetter.classList.add("typed");
            console.log(`${currentLetter.textContent}, ${currentLetter.innerText}`);
            if (
                event.key === currentLetter.textContent ||
                (event.key === " " && [SPACER_CHAR, RETYPE_CHAR].includes(currentLetter.textContent))
            ) {
                currentLetter.classList.add("correct");
            } else {
                currentLetter.classList.add("incorrect", "miss");
                if (forceRetypeCheckbox.checked && currentWordIndex == maxWord) {
                    currentWord.classList.add("miss");
                    currentWord.lastElementChild.textContent = RETYPE_CHAR;
                }
            }

            await onLetterCompleted();
        }
        console.log(`${event.key} (${event.code}), ${currentWordIndex}:${currentLetterIndex}, ${cursor}, ${maxCursor}`);

        await updateContentIfNeeded(event);
    }
}
const shouldStopOnWord = (wordElement) => {
    return Array.from(wordElement.children).reduce((a, b) => {
        return a || b.classList.contains("incorrect");
    }, false);
};

async function onLetterCompleted() {
    currentLetter.duration = Date.now() - letterTimeStart;
    letterTimeStart = Date.now();
    console.log(`current letter ${currentLetter.textContent} time start: ${letterTimeStart}`);
    if (currentLetterIndex === 0) {
        wordTimeStart = Date.now();
    }
    if (stopOnWordCheckBox.checked && shouldStopOnWord(currentWord)) {
        currentWord.classList.add("incorrect-word");
        currentWord.lastChild.classList.add("stop-on-word");
    } else {
        currentWord.classList.remove("incorrect-word");
        currentWord.lastChild.classList.remove("stop-on-word");
    }
    if (currentLetterIndex === currentWord.children.length - 1 && cursor === maxCursor) {
        if (currentWord.classList.contains("incorrect-word")) {
            for (const letter of currentWord.children) {
                if (letter.classList.contains("incorrect")) {
                    letter.classList.add("fix");
                }
            }
            return;
        }
        if (currentWord.classList.contains("miss")) {
            currentLetterIndex = 0;
            cursor -= currentWord.children.length - 1;
            currentWord.classList.remove("miss");
            for (const letter of currentWord.children) {
                clearTypedClassesFromLetter(letter);
            }
            currentWord.lastElementChild.textContent = SPACER_CHAR;
            updateActiveElements();
            return;
        } else {
            sendWordCompletedStatus(currentWordIndex);
            // updateStats();
        }
    }
    setCurrentIndexesToNextLetter();
    updateActiveElements();
    if (currentWord.offsetLeft === content.offsetLeft && currentLetterIndex === 0) {
        scrollContentToCenterWord();
    }
    incrementMaxCursorIfNeeded(cursor);
    cursor++;
}

function incrementMaxCursorIfNeeded(cursor) {
    maxCursor = cursor === maxCursor ? maxCursor + 1 : maxCursor;
    maxWord = Math.max(maxWord, currentWordIndex);
}

async function updateContentIfNeeded(keyDownEvent) {
    if (
        currentWordIndex % TOTAL_WORDS_ON_UPDATE === 0 &&
        currentLetterIndex === 0 &&
        keyDownEvent.key !== "Backspace" &&
        cursor === maxCursor
    ) {
        await addWordsToContent(TOTAL_WORDS_ON_UPDATE);
    }
}
function main() {
    content.focus();
    getConfig();
    resetWordsInContent();
    content.addEventListener("keydown", handleKeyDownEvent);
}

async function resetWordsInContent() {
    content.innerHTML = "";
    currentWordIndex = 0;
    currentLetterIndex = 0;

    await addWordsToContent(INITIAL_WORD_COUND);

    currentWord = content.firstElementChild;
    currentWord.classList.add("active");

    currentLetter = currentWord.firstElementChild;
    currentLetter.classList.add("active");
}

function updateActiveElements() {
    // remove active status from current text elements.
    currentLetter.classList.remove("active");
    currentWord.classList.remove("active");

    // update current text elements based on calculated index.
    currentWord = content.children[currentWordIndex];
    currentLetter = currentWord.children[currentLetterIndex];

    // add active statur to new current text elements.
    currentLetter.classList.add("active");
    currentWord.classList.add("active");
}

async function setCurrentIndexesToNextLetter() {
    currentLetterIndex++;
    if (currentLetterIndex >= currentWord.children.length) {
        currentLetterIndex = 0;
        currentWordIndex++;
    }
}

function setCurrentIndexesToPreviousLetter() {
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

function scrollContentToCenterWord() {
    currentWord.scrollIntoView({
        behavior: "smooth",
        block: "center",
    });
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

async function addWordsToContent(wordCount) {
    const contentElement = document.getElementById("content");
    let words;
    try {
        words = await getNewWordsByCount(wordCount);
    } catch (error) {
        console.error(`error fetching words: ${error}`);
    }
    for (const word of words) {
        const wordElement = await createWordElement(word);
        contentElement.appendChild(wordElement);
    }
}

async function getNewWordsByCount(wordCount) {
    const route = `words?n=${wordCount}`;
    try {
        const words = await sendRequestToBackend(route);
        console.log(`added new words: [${words}].`);
        return words;
    } catch (error) {
        console.error(`${error}`);
    }
}

async function sendWordCompletedStatus(wordIndex) {
    console.log(`${wordIndex} started`);
    const route = `word/completed`;
    const word = content.children[wordIndex];
    const wordLettersData = [];
    for (const letter of word.children) {
        if (letter.innerHTML === "&nbsp;") {
            continue;
        }
        wordLettersData.push({
            letter: letter.innerHTML,
            duration: letter.duration,
            miss: letter.classList.contains("miss"),
        });
    }
    const data = {
        word_count: wordIndex,
        duration: Date.now() - wordTimeStart,
        word_letters_data: wordLettersData,
    };
    console.log(`complted: ${JSON.stringify(data)}`);
    try {
        await sendRequestToBackend(route, "POST", data);
        console.log(`${wordIndex} completed`);
    } catch (error) {
        console.error(`failed to send word completed update.`);
    }
}

function getConfig() {
    const route = "config/";
    try {
        const config = sendRequestToBackend(route);
        for (const [key, value] of Object.entries(config)) {
            _config[key] = value;
        }
    } catch (error) {
        console.error(`could not send updated configuration.`);
    }
}

async function updateConfig() {
    const route = "config/";
    try {
        await sendRequestToBackend(route, "POST", _config);
        console.log("got the result");
    } catch (error) {
        console.error(`could not send updated configuration.`);
    }
}
