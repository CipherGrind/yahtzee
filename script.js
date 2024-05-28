let roundCount = 1;
let totalRounds = 12;
let heldDice = [
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false]
];
let diceRollsConfirmed = false;

function rollDice(section) {
    for (let i = 1; i <= 5; i++) {
        if (!heldDice[section - 1][i - 1]) {
            let dieValue = Math.floor(Math.random() * 6) + 1;
            document.getElementById('die' + section + '-' + i).textContent = dieValue;
        }
    }
    // Disable the roll button after rolling once
    document.getElementById('rollButton' + section).disabled = true;
}

function confirmHold(section) {
    if (section < 3) {
        transferHeldDice(section);
        document.getElementById('rollButton' + (section + 1)).disabled = false;
        document.getElementById('confirmHold' + (section + 1)).disabled = false;
    } else {
        diceRollsConfirmed = true;
        enableScoringSection();
    }
    document.getElementById('dice' + section).classList.add('disabled');
    document.getElementById('confirmHold' + section).disabled = true;
}

function transferHeldDice(section) {
    for (let i = 1; i <= 5; i++) {
        let dieValue = document.getElementById('die' + section + '-' + i).textContent;
        if (heldDice[section - 1][i - 1]) {
            document.getElementById('die' + (section + 1) + '-' + i).textContent = dieValue;
            heldDice[section][i - 1] = true;
            document.getElementById('die' + (section + 1) + '-' + i).classList.add('hold');
        } else {
            document.getElementById('die' + (section + 1) + '-' + i).classList.remove('hold');
            heldDice[section][i - 1] = false;
        }
    }
}

function toggleHold(section, dieIndex) {
    heldDice[section - 1][dieIndex - 1] = !heldDice[section - 1][dieIndex - 1];
    document.getElementById('die' + section + '-' + dieIndex).classList.toggle('hold');
}

function enableScoringSection() {
    const categories = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes', 'threeOfAKind', 'fourOfAKind', 'fullHouse', 'smallStraight', 'largeStraight', 'yahtzee'];
    categories.forEach(category => {
        const element = document.getElementById(category).parentNode;
        if (!element.classList.contains('selected')) {
            element.classList.add('available');
        }
    });
}

function disableScoringSection() {
    const categories = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes', 'threeOfAKind', 'fourOfAKind', 'fullHouse', 'smallStraight', 'largeStraight', 'yahtzee'];
    categories.forEach(category => {
        document.getElementById(category).parentNode.classList.remove('available');
    });
}

function selectCategory(category) {
    if (!diceRollsConfirmed) {
        alert('Please confirm all three dice rolls before selecting a score category.');
        return;
    }
    const diceValues = getDiceValuesFromFinalRoll();
    const score = calculateScore(category, diceValues);
    document.getElementById(category).textContent = score;
    document.getElementById(category).parentNode.classList.add('selected');
    document.getElementById(category).parentNode.classList.remove('available');
    updateTotalScore();
    resetRound();
    roundCount++;
    document.getElementById('roundCount').textContent = roundCount;
    diceRollsConfirmed = false;
    disableScoringSection();
    if (roundCount > totalRounds) {
        setTimeout(() => {
            showModal();
        }, 100); // Small delay to ensure the score is updated before the modal
    }
}

function getDiceValuesFromFinalRoll() {
    const diceValues = [];
    for (let i = 1; i <= 5; i++) {
        diceValues.push(parseInt(document.getElementById('die3-' + i).textContent));
    }
    return diceValues;
}

function resetRound() {
    heldDice = [
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false]
    ];
    for (let section = 1; section <= 3; section++) {
        for (let i = 1; i <= 5; i++) {
            document.getElementById('die' + section + '-' + i).classList.remove('hold');
            document.getElementById('die' + section + '-' + i).textContent = '_';
        }
        document.getElementById('dice' + section).classList.remove('disabled');
        document.getElementById('rollButton' + section).disabled = (section !== 1);
        document.getElementById('confirmHold' + section).disabled = (section !== 1);
    }
}

function calculateScore(category, diceValues) {
    let score = 0;
    const counts = {};
    diceValues.forEach(value => {
        counts[value] = (counts[value] || 0) + 1;
    });

    switch (category) {
        case 'ones':
            score = counts[1] ? counts[1] * 1 : 0;
            break;
        case 'twos':
            score = counts[2] ? counts[2] * 2 : 0;
            break;
        case 'threes':
            score = counts[3] ? counts[3] * 3 : 0;
            break;
        case 'fours':
            score = counts[4] ? counts[4] * 4 : 0;
            break;
        case 'fives':
            score = counts[5] ? counts[5] * 5 : 0;
            break;
        case 'sixes':
            score = counts[6] ? counts[6] * 6 : 0;
            break;
        case 'threeOfAKind':
            score = Object.values(counts).some(count => count >= 3) ? 15 : 0;
            break;
        case 'fourOfAKind':
            score = Object.values(counts).some(count => count >= 4) ? 20 : 0;
            break;
        case 'fullHouse':
            score = Object.values(counts).includes(3) && Object.values(counts).includes(2) ? 25 : 0;
            break;
        case 'smallStraight':
            score = checkStraight(counts, 4) ? 30 : 0;
            break;
        case 'largeStraight':
            score = checkStraight(counts, 5) ? 40 : 0;
            break;
        case 'yahtzee':
            score = Object.values(counts).some(count => count === 5) ? 50 : 0;
            break;
    }

    return score;
}

function checkStraight(counts, length) {
    const straights = [
        [1, 2, 3, 4],
        [2, 3, 4, 5],
        [3, 4, 5, 6],
        [1, 2, 3, 4, 5],
        [2, 3, 4, 5, 6]
    ];
    return straights.some(straight => straight.every(num => counts[num]));
}

function updateTotalScore() {
    const totalScoreElement = document.getElementById('totalScore');
    const totalScore = calculateTotalScore();
    totalScoreElement.textContent = totalScore;
}

function calculateTotalScore() {
    let totalScore = 0;
    const categories = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes', 'threeOfAKind', 'fourOfAKind', 'fullHouse', 'smallStraight', 'largeStraight', 'yahtzee'];
    categories.forEach(category => {
        totalScore += parseInt(document.getElementById(category).textContent) || 0;
    });
    return totalScore;
}

function showModal() {
    const modal = document.getElementById('endGameModal');
    const finalScoreMessage = document.getElementById('finalScoreMessage');
    finalScoreMessage.textContent = 'Game Over! Your total score is ' + calculateTotalScore();
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('endGameModal');
    modal.style.display = 'none';
}

function resetGame() {
    closeModal();
    roundCount = 1;
    document.getElementById('roundCount').textContent = roundCount;
    const categories = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes', 'threeOfAKind', 'fourOfAKind', 'fullHouse', 'smallStraight', 'largeStraight', 'yahtzee'];
    categories.forEach(category => {
        document.getElementById(category).textContent = '0';
        document.getElementById(category).parentNode.classList.remove('selected');
    });
    updateTotalScore();
    resetRound();
}

// Disable the scoring section initially
disableScoringSection();
