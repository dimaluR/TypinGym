const BACKEND_PROTO = "http";
const BACKEND_HOST = "127.0.0.1";
const BACKEND_PORT = 5007;

const LINE_WORD_COUND = 10;
const NEW_WORDS_GEN_LETTER_OFFSET = 30;
const LINE_LENGTH = 50;

let cursor = 0;
let l = 0;
const appContainer = document.querySelector("#app");
const modifierKeys = ["Control", "Alt", "Shift", "Meta", "Tab", "Escape"];
const content = document.querySelector("#content");
createText();
createText();
createText();

document.addEventListener("keydown", (event) => {
    let letterPrev;
    if (cursor !== 0) {
        letterPrev = document.querySelector(`#letter_${cursor - 1}`);
    }

    const letter = document.querySelector(`#letter_${cursor}`);
    letter.classList.remove("active");
    const currentWord = letter.closest(".word");
    if (letter === currentWord.lastElementChild) {
        currentWord.classList.remove("active");
        const nextWord = currentWord.nextElementSibling;
        if (nextWord) {
            nextWord.classList.add("active");
        }
    }
    const currentLine = currentWord.closest(".line");
    if (currentWord === currentLine.lastElementChild && letter === currentWord.lastElementChild) {
        currentLine.classList.remove("active");
        const nextLine = currentLine.nextElementSibling;
        if (nextLine) {
            nextLine.classList.add("active");
            createText();
            scrollContent();
        }
    }

    if (modifierKeys.includes(event.key)) {
        if (event.key === "Escape") {
            content.innerHTML = "";
            cursor = 0;
            l = 0;
            createText();
            return;
        }
        console.log(`modifier key pressed: ${event.key}`);
    } else if (event.code === "Backspace") {
        if (cursor !== 0) {
            letterPrev.classList.add("active");
            letterPrev.classList.remove("correct", "incorrect", "typed");
        }
        letter.classList.remove("correct", "incorrect");
        cursor = cursor === 0 ? cursor : cursor - 1;
    } else {
        letter.classList.add("typed");
        if (letter.textContent !== " ") {
            if (event.key === letter.textContent) {
                letter.classList.add("correct");
            } else {
                letter.classList.add("incorrect");
            }
        } else {
            content.scrollTop = content.scrollHeight;
        }
        cursor = cursor < l ? cursor + 1 : cursor;
    }

    console.log(`cursor at ${cursor}. key is ${event.key} (${event.code})`);
    const letterNext = document.querySelector(`#letter_${cursor}`);
    letterNext.classList.add("active");
});

function scrollContent() {
    const contentElement = document.querySelector("#content");
    const currentLine = document.querySelector(".line.active");

    if (currentLine) {
        const lineTop = currentLine.offsetTop;
        const lineHeight = currentLine.offsetHeight;
        const contentHeight = contentElement.offsetHeight;
        const targetScrollTop = lineTop - (contentHeight - lineHeight) / 2;
        contentElement.scrollTo({
            top: targetScrollTop,
            behavior: "smooth",
        });
    }
}
async function createText() {
    let wordElement;
    let words;
    try {
        words = await get_new_line(LINE_LENGTH);
    } catch (error) {
        console.error(`${error}`);
    }
    const currentLine = document.createElement("div");
    currentLine.className = "line";
    for (const [i, word] of words.entries()) {
        wordElement = document.createElement("word");
        wordElement.id = `word_${i}`;
        wordElement.className = "word";
        wordElement.word = word;
        for (let j = 0; j < word.length; j++) {
            const letter = document.createElement("letter");
            letter.id = `letter_${l++}`;
            letter.className = "letter";
            letter.textContent = word[j];
            if (j == 0) {
                letter.classList.add("first");
            }
            if (j == word.length - 1) {
                letter.classList.add("last");
            }
            wordElement.appendChild(letter);
        }
        currentLine.append(wordElement);
    }
    content.appendChild(currentLine);
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
