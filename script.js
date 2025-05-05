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
const setAsideContainer = document.getElementById("bank-container");
const checkboxes = Array.from(setAsideContainer.querySelectorAll("input[type='checkbox']"));
const labels = Array.from(setAsideContainer.querySelectorAll("label"));

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
  checkboxes.forEach((checkbox, idx) => {
    if (idx < currentRoll.length) {
      labels[idx].textContent = currentRoll[idx];
      checkbox.checked = false;
      checkbox.style.display = "inline-block";
      labels[idx].style.display = "inline-block";
    } else {
      checkbox.style.display = "none";
      labels[idx].style.display = "none";
    }
  });
}

//–– SELECTION ––
checkboxes.forEach((checkbox, idx) => {
  checkbox.addEventListener('change', () => toggleSelect(idx));
});

function toggleSelect(index) {
  if (selectedDice.includes(index)) {
    selectedDice = selectedDice.filter(i => i !== index);
  } else {
    selectedDice.push(index);
  }
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
function updateScoreDisplay() {
  valuesText.textContent = `Dice: ${currentRoll.join(", ")}`;
  scoreText.textContent = `Total: ${runningTotal} | Remaining dice: ${remainingDice}`;
}

function calculateFarkleScore(dice) {
    const counts = {};
    dice.forEach(value => {
        counts[value] = (counts[value] || 0) + 1;
    });

    let score = 0;

    // Check for specific combinations
    if (counts[1] >= 1 && counts[1] < 3) score += counts[1] * 100;
    if (counts[5] >= 1 && counts[5] < 3) score += counts[5] * 50;
    if (counts[1] === 3) score += 300;
    if (counts[2] === 3) score += 200;
    if (counts[3] === 3) score += 300;
    if (counts[4] === 3) score += 400;
    if (counts[5] === 3) score += 500;
    if (counts[6] === 3) score += 600;
    if (counts[1] === 4 || counts[2] === 4 || counts[3] === 4 || counts[4] === 4 || counts[5] === 4 || counts[6] === 4) score += 1000;
    if (counts[1] === 5 || counts[2] === 5 || counts[3] === 5 || counts[4] === 5 || counts[5] === 5 || counts[6] === 5) score += 2000;
    if (counts[1] === 6 || counts[2] === 6 || counts[3] === 6 || counts[4] === 6 || counts[5] === 6 || counts[6] === 6) score += 3000;

    // Check for special combinations
    const uniqueValues = Object.keys(counts).map(Number);
    if (uniqueValues.length === 6 && uniqueValues.includes(1) && uniqueValues.includes(2) && uniqueValues.includes(3) && uniqueValues.includes(4) && uniqueValues.includes(5) && uniqueValues.includes(6)) {
        score += 1500; // 1–6 straight
    }
    if (uniqueValues.length === 3 && uniqueValues.every(value => counts[value] === 2)) {
        score += 1500; // Three pairs
    }
    if (uniqueValues.length === 2 && uniqueValues.some(value => counts[value] === 4) && uniqueValues.some(value => counts[value] === 2)) {
        score += 1500; // Four of any number with a pair
    }
    if (uniqueValues.length === 2 && uniqueValues.every(value => counts[value] === 3)) {
        score += 2500; // Two triplets
    }

    return score;
}
