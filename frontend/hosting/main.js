import * as auth from "./js/auth.js";
import * as user from "./js/user.js";
import sendRequestToBackend from "./backend_gateway.js";
import * as contentState from "./js/content.js"
import {
    MODIFIER_KEYS,
    SPACER_CHAR,
    RETYPE_CHAR,
    TOTAL_WORDS_ON_UPDATE,
} from "./js/content.js";
const content = document.getElementById("content");

const signInButton = document.getElementById("user_sign_in");
const displayNameText = document.getElementById("user_display_name");
const signOutButton = document.getElementById("sign_out_icon");

const updateDisplayName = () => (displayNameText.innerText = auth.getCurrentUserDisplayName() || "Sign In");

auth.listenForAuthChanged(async () => {
    updateDisplayName();
    await updateSiteConfig();
    await updateWordsInContent();
    content.focus();
});
async function updateWordsInContent() {
    await contentState.resetWordsInContent();
    currentWord = content.firstElementChild;
    currentWord.classList.add("active");

    currentLetter = currentWord.firstElementChild;
    currentLetter.classList.add("active");
}
async function updateSiteConfig() {
    const config = auth.isUserSignedIn() ? await user.getUserConfig() : await user.getDefaultConfig();
    updateConfigLocal(config);
    updateSettingsPanel();
}

signInButton.onclick = () => auth.signInUser();
signOutButton.onclick = () => auth.signOutUser();

// cursor keeps track of the furthest position reached.
let cursor = 0;
let maxCursor = 0;
let maxWord = 0;

// track the current active text elements
let currentWord;
let currentLetter;

// keep track of the word time start;
let wordTimeStart = null;
let letterTimeStart = null;

let _config = {};

// sliders
const sp = document.getElementById("sp");
const menu = document.getElementById("menu");

function initCheckboxInput(checkboxElementId, updateValue) {
    const checkboxElement = document.getElementById(checkboxElementId);
    checkboxElement.checked = _config[updateValue];

    checkboxElement.oninput = async function () {
        console.log(`updating ${checkboxElementId} value with ${this.checked}`);
        updateConfigLocal({ [updateValue]: this.checked });
        await user.updateUserConfig(_config);
        await updateWordsInContent();
        content.focus();
    };
    return checkboxElement;
}

function initSliderElement(sliderElementId, updateValue) {
    const sliderElement = document.getElementById(sliderElementId);
    sliderElement.value = _config[updateValue];

    sliderElement.oninput = async function () {
        updateConfigLocal({ [updateValue]: this.value });
        await user.updateUserConfig(_config);
        await updateWordsInContent();
        content.focus();
    };
    return sliderElement;
}

const forceRetypeCheckbox = initCheckboxInput("force_retype_checkbox", "force_retype");
const stopOnWordCheckBox = initCheckboxInput("stop_on_word_checkbox", "stop_on_word");
const capitalSlider = initSliderElement("capitalFreqSlider", "capitalize");
const surroundSlider = initSliderElement("surroundFreqSlider", "surround");
const punctuationSlider = initSliderElement("punctuationFreqSlider", "punctuation");
const maxWordLengthSlider = initSliderElement("maxWordLengthSlider", "max_word_length");

function updateSettingsPanel() {
    forceRetypeCheckbox.checked = _config["force_retype"];
    stopOnWordCheckBox.checked = _config["stop_on_word"];
    capitalSlider.value = _config["capitalize"];
    surroundSlider.value = _config["surround"];
    punctuationSlider.value = _config["punctuation"];
    maxWordLengthSlider.value = _config["max_word_length"];
}

// main function
main();

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
                await updateWordsInContent();
            }
            console.log(`modifier key pressed: ${event.key}`);
        } else if (event.code === "Backspace") {
            contentState.setCurrentIndexesToPreviousLetter();
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
                if (forceRetypeCheckbox.checked && contentState.currentWordIndex == maxWord) {
                    currentWord.classList.add("miss");
                    currentWord.lastElementChild.textContent = RETYPE_CHAR;
                }
            }

            await onLetterCompleted();
            await updateContentIfNeeded(event);
        }
        console.log(`${event.key} (${event.code}), ${contentState.currentWordIndex}:${contentState.currentLetterIndex}, ${cursor}, ${maxCursor}`);

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
    if (contentState.currentLetterIndex === 0) {
        wordTimeStart = Date.now();
    }
    if (stopOnWordCheckBox.checked && shouldStopOnWord(currentWord)) {
        currentWord.classList.add("incorrect-word");
        currentWord.lastChild.classList.add("stop-on-word");
    } else {
        currentWord.classList.remove("incorrect-word");
        currentWord.lastChild.classList.remove("stop-on-word");
    }
    if (contentState.currentLetterIndex === currentWord.children.length - 1 && cursor === maxCursor) {
        if (currentWord.classList.contains("incorrect-word")) {
            for (const letter of currentWord.children) {
                if (letter.classList.contains("incorrect")) {
                    letter.classList.add("fix");
                }
            }
            return;
        }
        if (currentWord.classList.contains("miss")) {
            contentState.currentLetterIndex = 0;
            cursor -= currentWord.children.length - 1;
            currentWord.classList.remove("miss");
            for (const letter of currentWord.children) {
                clearTypedClassesFromLetter(letter);
            }
            currentWord.lastElementChild.textContent = SPACER_CHAR;
            updateActiveElements();
            return;
        } else {
            sendWordCompletedStatus(contentState.currentWordIndex);
        }
    }
    await contentState.setCurrentIndexesToNextLetter(currentWord.children.length)
    updateActiveElements();
    if (currentWord.offsetLeft === content.offsetLeft && contentState.currentLetterIndex === 0) {
        scrollContentToCenterWord();
    }
    incrementMaxCursorIfNeeded();
    cursor++;
}

function incrementMaxCursorIfNeeded() {
    maxCursor = cursor === maxCursor ? maxCursor + 1 : maxCursor;
    maxWord = Math.max(maxWord, contentState.currentWordIndex);
}

async function updateContentIfNeeded(keyDownEvent) {
    if (
        contentState.currentWordIndex % TOTAL_WORDS_ON_UPDATE === 0 &&
        contentState.currentLetterIndex === 0 &&
        keyDownEvent.key !== "Backspace" &&
        cursor === maxCursor &&
        cursor !== 0
    ) {
        await contentState.addWordsToContent(TOTAL_WORDS_ON_UPDATE);
        console.log("adding words to content")
    }
}
async function main() {
    await updateSiteConfig();
    await updateWordsInContent();
    content.focus();
    content.addEventListener("keydown", handleKeyDownEvent);
}

function updateActiveElements() {
    // remove active status from current text elements.
    currentLetter.classList.remove("active");
    currentWord.classList.remove("active");

    // update current text elements based on calculated index.
    currentWord = content.children[contentState.currentWordIndex];
    currentLetter = currentWord.children[contentState.currentLetterIndex];

    // add active statur to new current text elements.
    currentLetter.classList.add("active");
    currentWord.classList.add("active");
}


function scrollContentToCenterWord() {
    currentWord.scrollIntoView({
        behavior: "smooth",
        block: "center",
    });
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
async function updateConfigLocal(config) {
    for (const [key, value] of Object.entries(config)) {
        _config[key] = typeof value == "boolean" ? value : parseInt(value);
    }
}
