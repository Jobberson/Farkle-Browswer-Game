//–– STATE ––
let remainingDice = 6;
let runningTotal = 0;
let currentRoll = []; // e.g. [4,1,2,6,…]
let selectedDice = []; // subset of currentRoll

//–– DOM REFS ––
const valuesText = document.getElementById("valuesText");
const scoreText = document.getElementById("scoreText");
const diceBox = document.getElementById("dice-box1");
const setAsideBtn = document.getElementById("bank-button");

//–– ROLLING ––
function rollDice() {
  // roll `remainingDice` dice…
  rollADie({
    element: diceBox,
    numberOfDice: remainingDice,
    callback: onRolled,
    delay: 10000,
    soundVolume: 0
  });
}

function onRolled(results) {
  currentRoll = results;
  selectedDice = [];
  renderDice();
  updateScoreDisplay();
}

//–– RENDERING ––
function renderDice() {
  diceBox.innerHTML = "";
  currentRoll.forEach((value, idx) => {
    const die = document.createElement("div");
    die.textContent = value;
    die.className = "die" + (selectedDice.includes(idx) ? " selected" : "");
    die.onclick = () => toggleSelect(idx);
    diceBox.appendChild(die);
  });
}

//–– SELECTION ––
function toggleSelect(index) {
  if (selectedDice.includes(index)) {
    selectedDice = selectedDice.filter(i => i !== index);
  } else {
    selectedDice.push(index);
  }
  renderDice();
  // optional: live‐show partial score
  const combo = selectedDice.map(i => currentRoll[i]);
  scoreText.textContent = `This combo scores: ${calculateFarkleScore(combo)}`;
}

//–– BANKING (set aside) ––
function bankSelection() {
  const combo = selectedDice.map(i => currentRoll[i]);
  const comboScore = calculateFarkleScore(combo);
  if (comboScore === 0) {
    alert("Those dice don’t score—pick a valid combination.");
    return;
  }
  // commit score
  runningTotal += comboScore;
  // remove those dice from the pool
  // we filter out by index
  currentRoll = currentRoll.filter((_, idx) => !selectedDice.includes(idx));
  remainingDice = currentRoll.length;
  // if none left, “hot dice” – reset to full rack
  if (remainingDice === 0) remainingDice = 6;
  
  // clear selection, re‐render
  selectedDice = [];
  renderDice();
  updateScoreDisplay();
}

//–– UI HOOKUP ––
document.getElementById("roll-button").onclick = rollDice();
document.getElementById("bank-button").onclick = bankSelection();

function updateScoreDisplay() {
  valuesText.textContent = `Dice: ${currentRoll.join(", ")}`;
  scoreText.textContent = `Total: ${runningTotal} | Remaining dice: ${remainingDice}`;
}