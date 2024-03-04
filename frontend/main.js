let cursor = 0;
let contentText;
const appContainer = document.querySelector("#app");
const modifierKeys = ["Control", "Alt", "Shift", "Meta", "Tab", "Escape"];
appContainer.innerHTML = `
  <div>
      <div id="contentHolder">
          <line id="content" class=line>some</line>
      </div>
  </div>
`;

createText();

document.addEventListener("keydown", (event) => {
    let letterPrev;
    if (cursor !== 0) {
        letterPrev = document.querySelector(`#letter_${cursor - 1}`);
        letterPrev.classList.remove("cursor");
    }
    const letter = document.querySelector(`#letter_${cursor}`);
    letter.classList.remove("cursor");
    if (modifierKeys.includes(event.key)) {
        if (event.key === "Escape") {
            handleLineCompletion();
        }
        console.log(`modifier key pressed: ${event.key}`);
    } else if (event.code === "Backspace") {
        if (cursor !== 0) {
            letterPrev.classList.add("cursor");
            letterPrev.classList.remove("correct", "incorrect", "typed");
        }
        letter.classList.remove("correct", "incorrect");
        cursor = cursor === 0 ? cursor : cursor - 1;
    } else {
        letter.classList.add("typed");
        if (contentText[cursor] !== " ") {
            if (event.key === contentText[cursor]) {
                letter.classList.add("correct");
            } else {
                letter.classList.add("incorrect");
            }
        }
        cursor = cursor < contentText.length ? cursor + 1 : cursor;
    }

    console.log(`cursor at ${cursor}. key is ${event.key} (${event.code})`);
    if (cursor === contentText.length) {
        handleLineCompletion();
    } else {
    const letterNext = document.querySelector(`#letter_${cursor}`);
    letterNext.classList.add("cursor");
    }
});

function handleLineCompletion() {
    cursor = 0;
    createText();
}
async function createText() {
    const content = document.querySelector("#content");
    content.innerHTML = "";
    contentText = "";
    for (let i = 0; i < 10; i++) {
        try {
            const word = await get_new_word();
            contentText = `${contentText} ${word.substring(1, word.length - 1)}`;
        } catch (error) {
            contentText = `could not retrieve word. ${error}`;
        }
    }
    contentText = contentText.trim()
    for (let i = 0; i < contentText.length; i++) {
        const letter = document.createElement("letter");
        letter.id = `letter_${i}`;
        letter.className = "letter";
        letter.textContent = contentText[i];
        letter.tabIndex = 0;
        if (i === 0){
            letter.classList.add("cursor");
        }
        content.appendChild(letter);
    }
}

async function get_new_word() {
    try {
        const response = await fetch("http://127.0.0.1:5007/word");
        if (!response.ok) {
            throw new Error(`HTTP response error: ${response.status}`);
        }
        const text = await response.text();
        return text;
    } catch (error) {
        throw error;
    }
}

async function get_new_line() {
    try {
        const response = await fetch("http://127.0.0.1:5007/line");
        if (!response.ok) {
            throw new Error(`HTTP response error: ${response.status}`);
        }

        const text = await response.text();
        console.log("new line is incomming");
        return text;
    } catch (error) {
        console.error(`Could not fetch line: ${error}`);
        throw error;
    }
}
