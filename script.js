const valuestext = Document.getElementById("valuesText");

function response(res) {
    // returns an array of the values from the dice
    // console.log(res)
    valuestext.textContent = res;
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