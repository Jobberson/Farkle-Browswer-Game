//–– STATE ––
let remainingDice = 6;
let runningTotal = 0;
let totalPoints = 0;
let currentRoll = []; // e.g. [4,1,2,6,…]
let selectedDice = []; // subset of currentRoll

//–– DOM REFS ––
const totalScoreText = document.getElementById("totalScoreText");
const scoreText = document.getElementById("scoreText");
const diceBox = document.getElementById("dice-box1");
const setAsideBtn = document.getElementById("bank-button");
const setAsideContainer = document.getElementById("bank-container");
const checkboxes = Array.from(setAsideContainer.querySelectorAll("input[type='checkbox']"));
const labels = Array.from(setAsideContainer.querySelectorAll("label"));

//-- TURNS --
function finishTurn() {
    totalPoints += runningTotal;
    runningTotal = 0;
    remainingDice = 6;
    currentRoll = [];
    selectedDice = [];
    updateScoreDisplay();
    checkForWin();
}

//–– ROLLING ––
function rollDice() {
  rollADie({
    element: diceBox,
    numberOfDice: remainingDice,
    callback: onRolled,
    delay: 9999999,
    soundVolume: 0
  });
}

function onRolled(results) {
    currentRoll = results;
    selectedDice = [];
    renderDice();
    updateScoreDisplay();
  
    // Check if the rolled dice can make a combination
    const comboScore = calculateFarkleScore(currentRoll);
    if (comboScore === 0) {
        alert("No valid combination. Turn ends.");
        runningTotal = 0;
        finishTurn();
    }
}

//–– HELPER: which indices in a roll are actually scoring dice? ––
function getScoringIndices(dice) {
  const indices = new Set();
  const valueIndices = {};
  
  // group indices by face value
  dice.forEach((v, i) => {
    if (!valueIndices[v]) valueIndices[v] = [];
    valueIndices[v].push(i);
  });

  const uniqueVals = Object.keys(valueIndices).map(Number);
j
  // special‐combo: straight, 3 pairs, 4+pair, two triplets
  const isStraight = uniqueVals.length === 6;
  
  const isThreePairs = uniqueVals.length === 3 && uniqueVals.every(v => valueIndices[v].length === 2);
  
  const isFourPlusPair = uniqueVals.length === 2 
                        && uniqueVals.some(v => valueIndices[v].length === 4)
                        && uniqueVals.some(v => valueIndices[v].length === 2);
  
  const isTwoTriplets = uniqueVals.length === 2 && uniqueVals.every(v => valueIndices[v].length === 3);

  if (isStraight || isThreePairs || isFourPlusPair || isTwoTriplets) {
    // every die is part of the special combo
    return new Set(dice.map((_, i) => i));
  }

  // singles (1s and 5s)
  [1, 5].forEach(v => {
    if (valueIndices[v]) valueIndices[v].forEach(i => indices.add(i));
  });

  // any kind (3 or more of a kind)
  for (const [v, inds] of Object.entries(valueIndices)) {
    if (inds.length >= 3) {
      // include all of them (3, 4, 5, or 6 of a kind all count)
      inds.forEach(i => indices.add(i));
    }
  }

  return indices;
}

//–– RENDERING ––
function renderDice() {
  const scoringIndices = getScoringIndices(currentRoll);

  checkboxes.forEach((checkbox, idx) => {
    if (idx < currentRoll.length) {
      labels[idx].textContent = currentRoll[idx];
      checkbox.checked = false;
      // disable any die that isn’t scoring
      checkbox.disabled = !scoringIndices.has(idx);
      checkbox.style.visibility = 'visible';
      labels[idx].style.visibility = 'visible';
      // dim non-scoring faces so the player can see why
      labels[idx].style.opacity = scoringIndices.has(idx) ? '1' : '0.3';
    } else {
      checkbox.style.visibility = 'hidden';
      labels[idx].style.visibility = 'hidden';
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
  // live‐show partial score
  const combo = selectedDice.map(i => currentRoll[i]);
  scoreText.textContent = `This combo scores: ${calculateFarkleScore(combo)}`;
}

//–– BANKING (set aside) ––
function bankSelection() {
  const scoringIndices = getScoringIndices(currentRoll);
  // make sure they only picked scoring dice
  if (!selectedDice.every(i => scoringIndices.has(i))) {
    alert("You can only set aside dice that contribute to the score.");
    return;
  }

  const combo = selectedDice.map(i => currentRoll[i]);
  const comboScore = calculateFarkleScore(combo);
  if (comboScore === 0) {
    alert("Those dice don’t score. Pick a valid combination.");
    return;
  }

  // commit score
  runningTotal += comboScore;

  // remove those dice from the pool
  currentRoll = currentRoll.filter((_, idx) => !selectedDice.includes(idx));
  remainingDice = currentRoll.length;

  // hot dice!
  if (remainingDice === 0) remainingDice = 6;

  // clear selection, re‐render
  selectedDice = [];
  renderDice();
  updateScoreDisplay();
}

//–– UI HOOKUP ––
function updateScoreDisplay() {
  totalScoreText.textContent = `Total Score: ${totalPoints}`;
  scoreText.textContent = `Total: ${runningTotal} | Remaining dice: ${remainingDice}`;
}

//-- SCORE --
function checkForWin(){
    if(totalPoints >= 10000){
        totalScoreText.textContent = "You won!";
        scoreText.textContent = "You won!";
    }
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
