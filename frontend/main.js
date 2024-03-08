const BACKEND_PROTO = "http";
const BACKEND_HOST = "127.0.0.1";
const BACKEND_PORT = 5007;

const LINE_WORD_COUND = 10;
const NEW_WORDS_GEN_LETTER_OFFSET = 30;
const LINE_LENGTH = 50;

const modifierKeys = ["Control", "Alt", "Shift", "Meta", "Tab", "Escape"];
const content = document.getElementById("content");

// track the current active text elements
let currentLine;
let currentWord;
let currentLetter;

// use text element relative indexes to avoid unneccessary DOM queries and make guten blazingly fast.
let currentLineIndex;
let currentWordIndex;
let currentLetterIndex;

// main function
await main();

async function main() {
    content.focus();
    await init();
    content.addEventListener("keydown", async(event) => {
        if (modifierKeys.includes(event.key)) {
            if (event.key === "Escape") {
                await init();
            }
            console.log(`modifier key pressed: ${event.key}`);
        } else if (event.code === "Backspace") {
            setCurrentIndexesToPreviousLetter();
            updateActiveElements();
            currentLetter.classList.remove("correct", "incorrect", "typed");

            if (_isLastLetterOfLine()) {
                scrollContentToCenterLine();
                content.removeChild(content.lastElementChild);
            }
        } else {
            currentLetter.classList.add("typed");
            if (event.key === currentLetter.textContent) {
                currentLetter.classList.add("correct");
            } else {
                currentLetter.classList.add("incorrect");
            }
            setCurrentIndexesToNextLetter();
            updateActiveElements();
            if (_isFirstLetterOfLine()) {
                scrollContentToCenterLine();
                addLine();
            }
        }

        console.log(
            `key is ${event.key} (${event.code}), ${currentLineIndex}:${currentWordIndex}:${currentLetterIndex}`,
        );
    });
}

async function init() {
    content.innerHTML = "";
    currentLineIndex = 0;
    currentWordIndex = 0;
    currentLetterIndex = 0;

    await addLine();
    await addLine();
    await addLine();
    currentLine = content.firstElementChild;
    currentLine.classList.add("active");

    currentWord = currentLine.firstElementChild;
    currentWord.classList.add("active");

    currentLetter = currentWord.firstElementChild;
    currentLetter.classList.add("active");
}

function setCurrentActiveElements() {
    currentLetter = document.querySelector(".letter.active");
    currentWord = document.querySelector(".word.active");
    currentLine = document.querySelector(".line.active");
}

function _isFirstLetterOfLine() {
    return currentWordIndex === 0 && currentLetterIndex === 0;
}

function _isLastLetterOfLine() {
    return (
        currentWordIndex === currentLine.children.length - 1 &&
        currentLetterIndex === currentWord.children.length - 1
    );
}

function updateActiveElements() {
    // remove active status from current text elements.
    currentLetter.classList.remove("active");
    currentWord.classList.remove("active");
    currentLine.classList.remove("active");

    // update current text elements based on calculated index.
    currentLine = content.children[currentLineIndex];
    currentWord = currentLine.children[currentWordIndex];
    currentLetter = currentWord.children[currentLetterIndex];

    // add active statur to new current text elements.
    currentLetter.classList.add("active");
    currentWord.classList.add("active");
    currentLine.classList.add("active");
}

function setCurrentIndexesToNextLetter() {
    currentLetterIndex++;
    if (currentLetterIndex >= currentWord.children.length) {
        currentLetterIndex = 0;
        currentWordIndex++;
        if (currentWordIndex >= currentLine.children.length) {
            currentWordIndex = 0;
            currentLineIndex++;
        }
    }
}

function setCurrentIndexesToPreviousLetter() {
    currentLetterIndex--;
    if (currentLetterIndex < 0) {
        currentWordIndex--;
        if (currentWordIndex < 0) {
            if (currentLineIndex === 0) {
                currentWordIndex = 0;
                currentLetterIndex = 0;
            } else {
                currentLineIndex--;
                currentWordIndex =
                    content.children[currentLineIndex].children.length - 1;
                currentLetterIndex =
                    content.children[currentLineIndex].children[
                        currentWordIndex
                    ].children.length - 1;
            }
        } else {
            currentLetterIndex =
                currentLine.children[currentWordIndex].children.length - 1;
        }
    }
}

function scrollContentToCenterLine() {
    currentLine.scrollIntoView({
        behavior: "smooth",
        block: "center",
    });
}

function createLetterElement(letter) {
    const letterElement = document.createElement("letter");
    letterElement.className = "letter";
    letterElement.textContent = letter;
    return letterElement;
}

function createWordElement(word) {
    const wordElement = document.createElement("div");
    wordElement.className = "word";
    for (let j = 0; j < word.length; j++) {
        const letter = word[j];
        const letterElement = createLetterElement(letter);
        wordElement.appendChild(letterElement);
    }
    return wordElement;
}

async function createLineElement() {
    const lineElement = document.createElement("div");
    lineElement.className = "line";
    let wordElement;
    let words;
    try {
        words = await getNewLineByLength(LINE_LENGTH);
    } catch (error) {
        console.error(`error fetching words: ${error}`);
    }
    words.forEach((word) => {
        wordElement = createWordElement(word);
        lineElement.appendChild(wordElement);
    });
    return lineElement;
}

async function addLine() {
    const lineElement = await createLineElement();
    content.appendChild(lineElement);
}

async function getNewLineByLength(length) {
    const route = `line?length=${length}`;
    try {
        const words = await sendRequestToBackend(route);
        return words;
    } catch (error) {
        console.log(`${error}`);
    }
}

async function sendRequestToBackend(route) {
    try {
        const response = await fetch(
            `${BACKEND_PROTO}://${BACKEND_HOST}:${BACKEND_PORT}/${route}`,
        );
        if (!response.ok) {
            throw new Error(`HTTP response error: ${response.status}`);
        }
        const text = await response.json();
        return text;
    } catch (error) {
        throw error;
    }
}
