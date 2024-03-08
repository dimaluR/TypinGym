const BACKEND_PROTO = "http";
const BACKEND_HOST = "127.0.0.1";
const BACKEND_PORT = 5007;

const LINE_WORD_COUND = 10;
const NEW_WORDS_GEN_LETTER_OFFSET = 30;
const LINE_LENGTH = 50;

const appContainer = document.querySelector("#app");
const modifierKeys = ["Control", "Alt", "Shift", "Meta", "Tab", "Escape"];
const content = document.querySelector("#content");
let currentLine;
let currentWord;
let currentLetter;

function closest_prev_line() {
    const prevLine = currentLine.previousElementSibling;
    if (!prevLine) {
        return currentLine;
    }
    return prevLine;
}

function closest_next_line() {
    return currentLine.nextElementSibling;
}

function closest_prev_word() {
    if (currentWord !== currentLine.firstElementChild) {
        return currentWord.previousElementSibling;
    }
    if (currentLine == content.firstElementChild) {
        return currentWord;
    }
    const prevLine = closest_prev_line();
    return prevLine.lastElementChild;
}
function closest_next_word() {
    if (currentWord !== currentLine.lastElementChild) {
        return currentWord.nextElementSibling;
    }

    const nextLine = closest_next_line();
    return nextLine.firstElementChild;
}

function closest_prev_letter() {
    if (currentLetter !== currentWord.firstElementChild) {
        return currentLetter.previousElementSibling;
    }
    if (
        currentLine === content.firstElementChild &&
        currentWord === currentLine.firstElementChild
    ) {
        return currentLetter;
    }
    const prevWord = closest_prev_word();
    return prevWord.lastElementChild;
}

function closest_next_letter() {
    if (currentLetter !== currentWord.lastElementChild) {
        return currentLetter.nextElementSibling;
    }
    const nextWord = closest_next_word();
    return nextWord.firstElementChild;
}

async function init() {
    content.innerHTML = "";
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

await init();

function set_prev_element_activity() {
    currentLetter.classList.remove("active");
    const prevLetter = closest_prev_letter();
    prevLetter.classList.add("active");
    if (currentLetter === currentWord.firstElementChild) {
        currentWord.classList.remove("active");
        const prevWord = closest_prev_word();
        prevWord.classList.add("active");
        if (currentWord == currentLine.firstElementChild) {
            currentLine.classList.remove("active");
            const prevLine = closest_prev_line();
            prevLine.classList.add("active");
        }
    }
}

function set_next_element_activity() {
    currentLetter.classList.remove("active");
    const nextLetter = closest_next_letter();
    nextLetter.classList.add("active");
    if (currentLetter === currentWord.lastElementChild) {
        currentWord.classList.remove("active");
        const nextWord = closest_next_word();
        nextWord.classList.add("active");
        if (currentWord === currentLine.lastElementChild) {
            currentLine.classList.remove("active");
            const nextLine = closest_next_line();
            nextLine.classList.add("active");
        }
    }
}

function set_current_elements() {
    currentLetter = document.querySelector(".letter.active");
    currentWord = document.querySelector(".word.active");
    currentLine = document.querySelector(".line.active");
}
document.addEventListener("keydown", (event) => {
    const letter = currentLetter;

    if (modifierKeys.includes(event.key)) {
        if (event.key === "Escape") {
            init();
            return;
        }
        console.log(`modifier key pressed: ${event.key}`);
    } else if (event.code === "Backspace") {
        const prevLetter = closest_prev_letter();
        prevLetter.classList.remove("correct", "incorrect", "typed");
        set_prev_element_activity();
        if (
            currentWord === currentLine.firstElementChild &&
            letter === currentWord.firstElementChild &&
            currentLine !== content.firstElementChild
        ) {
            scrollContentToCenterLine();
            content.removeChild(content.lastElementChild);
        }
    } else {
        letter.classList.add("typed");

        if (event.key === letter.textContent) {
            letter.classList.add("correct");
        } else {
            letter.classList.add("incorrect");
        }
        set_next_element_activity();
        if (
            currentWord === currentLine.lastElementChild &&
            letter === currentWord.lastElementChild
        ) {
            scrollContentToCenterLine();
            addLine();
        }
    }

    console.log(`key is ${event.key} (${event.code})`);
    set_current_elements();
});

function scrollContentToCenterLine() {
    document.querySelector(".line.active").scrollIntoView({
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
        words = await get_new_line(LINE_LENGTH);
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
async function get_words(n) {
    const route = `words?n=${n}`;
    try {
        const word = await send_backend_request(route);
        return word;
    } catch (error) {
        console.error(`${error}`);
    }
}

async function get_new_word() {
    const route = "word";
    try {
        const word = await send_backend_request(route);
        return word;
    } catch (error) {
        console.error(`${error}`);
    }
}

async function get_new_line(length) {
    const route = `line?length=${length}`;
    try {
        const words = await send_backend_request(route);
        return words;
    } catch (error) {
        console.log(`${error}`);
    }
}

async function send_backend_request(route) {
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
