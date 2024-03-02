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
    if (event.code === "Backspace") {
        cursor = cursor > 0 ? cursor - 1 : cursor;
        letterArray[cursor] = 0;
    } else if (modifierKeys.includes(event.key)) {
        if (event.key === "Escape") {
            handleCompletion();
        }
        console.log(`modifier key pressed: ${event.key}`);
    } else {
        letterArray[cursor] = contentText[cursor] == event.key ? 1 : -1;
        cursor = cursor < contentText.length ? cursor + 1 : cursor;
    }
    console.log(`cursor at ${cursor}. key is ${event.key} (${event.code})`);
    if (cursor === contentText.length) {
        handleCompletion();
    }
    renderText();
});

function handleCompletion() {
    alert(
        `Completed typing sentence. successfully typed ${letterArray.reduce((acc, val) => (acc += val ? val > 0 : 0), 0)}`,
    );
    cursor = 0;
    letterArray = new Array(contentText.length).fill(0);
}
function createText() {
    const content = document.querySelector("#content");
    for (let i = 0; i < contentText.length; i++) {
        const letter = document.createElement("letter");
        letter.id = `letter_${i}`;
        letter.className = "letter";
        letter.textContent = contentText[i];
        content.appendChild(letter);
    }
}
function renderText() {
    for (let i = 0; i < contentText.length; i++) {
        const letter = document.querySelector(`#letter_${i}`);
        letter.className = "letter";
        if (i === cursor) {
            letter.classList.add("cursor");
        }
        if (letterArray[i] == 1) {
            letter.classList.add("correct");
        } else if (letterArray[i] == -1) {
            letter.classList.add("incorrect");
        }
    }
}
