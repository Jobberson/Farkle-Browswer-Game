const valuestext = document.getElementById("valuesText");
const scoretext = document.getElementById("scoreText");
const setAsideContainer = document.getElementById("set-aside-container");

let numOfDice = 6;
let runningTotal = 0;
let setAsideDice = [];

function response(res) {
    valuesText.textContent = `Dice results: ${res.join(', ')}`;
    const score = calculateFarkleScore(res);
    scoreText.textContent = `Score: ${score}`;
    runningTotal += score;
    updateSetAsideContainer(res);
}

function rollDiceWithoutValues() {
  const element = document.getElementById('dice-box1');
  const numberOfDice = +document.getElementById('number1').value;
  const options = {
    element, // element to display the animated dice in.
    numberOfDice, // number of dice to use 
    callback: response,
    delay: 10000,
    soundVolume: 0
  }
  rollADie(options);
}

function updateSetAsideContainer(dice) {
    setAsideContainer.innerHTML = '';
    dice.forEach(value => {
    const dieElement = document.createElement('div');
    dieElement.className = 'die';
    dieElement.textContent = value;
    dieElement.onclick = () => setAsideDie(value);
    setAsideContainer.appendChild(dieElement);
    });
}
    
function setAsideDie(value) {
    numOfDice -= 1;
    if(numOfDice === 0)
        numOfDice = 6;

    setAsideDice.push(value);
    runningTotal += calculateFarkleScore([value]);
    scoreText.textContent = `Running Total: ${runningTotal}`;
    updateSetAsideContainer(setAsideDice);
}
    

function calculateFarkleScore(dice) {
  const counts = {};
  dice.forEach(value => {
    counts[value] = (counts[value] || 0) + 1;
  });

  let score = 0;

  // Check for specific combinations
  if (counts[1] === 1) score += 100;
  if (counts[5] === 1) score += 50;
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