let cursor = 0;
const contentText = `The conditional statements for updating the cursor position seem incorrect.`;
let letterArray = [].fill(0);
const appContainer = document.querySelector("#app");
const modifierKeys = ["Control", "Alt", "Shift", "Meta", "Tab", "Escape"];
appContainer.innerHTML = `
  <div>
      <div id="contentHolder">
          <p id="content"></p>
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
            handleCompletion();
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
        handleCompletion();
    }
    const letterNext = document.querySelector(`#letter_${cursor}`);
    letterNext.classList.add("cursor");
});

function handleCompletion() {
    alert(`Completed typing sentence. reseting.`);
    cursor = 0;
    createText();
}
function createText() {
    const content = document.querySelector("#content");
    content.innerHTML = "";
    for (let i = 0; i < contentText.length; i++) {
        const letter = document.createElement("letter");
        letter.id = `letter_${i}`;
        letter.className = "letter";
        letter.textContent = contentText[i];
        letter.tabIndex = 0;
        content.appendChild(letter);
    }
}
