// Card data (simple numbers for this game)
const cardValues = ['🍎', '🍌', '🍓', '🍉', '🍇', '🍍', '🍎', '🍌', '🍓', '🍉', '🍇', '🍍'];

let flippedCards = [];
let matchedCards = 0;
let lockBoard = false;
let activeScore = 0;
let maxScore = 0;
let lives = 6;
let gameStarted = false; // To track if the game has started

// Function to update score display
function updateScores() {
    document.getElementById('active-score').textContent = activeScore;
    document.getElementById('max-score').textContent = maxScore;
}

// Function to update lives display
function updateLives() {
    const hearts = document.querySelectorAll('.heart');
    hearts.forEach((heart, index) => {
        if (index >= lives) {
            heart.classList.add('heart-lost'); // Drop-out effect on lost heart
        } else {
            heart.classList.remove('heart-lost');
        }
        heart.textContent = index < lives ? '❤️' : '🤍'; // 🤍 for blank hearts
        heart.classList.remove('heart-lost', 'heart-blank'); // Reset any lost or blank heart styles
    });
}

// Function to shuffle the card array
function shuffleCards() {
    return cardValues.sort(() => Math.random() - 0.5);
}

// Function to create the cards and render them on the board
function createGameBoard() {
    const shuffledCards = shuffleCards();
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';  // Clear any existing cards

    shuffledCards.forEach((value, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.setAttribute('data-id', index);
        card.setAttribute('data-value', value);
        card.addEventListener('click', flipCard);

        const cardContent = document.createElement('div');
        cardContent.classList.add('hidden');
        cardContent.textContent = value;

        card.appendChild(cardContent);
        gameBoard.appendChild(card);
    });
}

// Function to flip the card
function flipCard() {
    if (lockBoard || this.classList.contains('card-flipped')) return;

    this.classList.add('card-flipped');
    const cardContent = this.querySelector('div');
    cardContent.classList.remove('hidden');
    cardContent.classList.add('animate-pop'); // Pop-out animation for card content

    flippedCards.push(this);

    // Check if two cards are flipped
    if (flippedCards.length === 2) {
        checkMatch();
    }
}

// Function to check if the flipped cards match
function checkMatch() {
    lockBoard = true;
    const [card1, card2] = flippedCards;
    const card1Value = card1.getAttribute('data-value');
    const card2Value = card2.getAttribute('data-value');

    if (card1Value === card2Value) {
        activeScore++;
        maxScore = Math.max(maxScore, activeScore);
        updateScores();

        matchedCards++;
        flippedCards = [];

        if (matchedCards === cardValues.length / 2) {
            setTimeout(() => {
                alert('You won! Congratulations!');
                resetGame(); // Reset the game after winning
            }, 500);
        } else {
            lockBoard = false;
        }
    } else {
        loseLife();
        setTimeout(() => {
            card1.classList.remove('card-flipped');
            card2.classList.remove('card-flipped');
            card1.querySelector('div').classList.add('hidden');
            card2.querySelector('div').classList.add('hidden');
            flippedCards = [];
            lockBoard = false;
        }, 1000);
    }
}

// Function to reduce a life on a mismatch
function loseLife() {
    if (lives > 0) {
        lives--;
        const hearts = document.querySelectorAll('.heart');

        // Apply the dropping effect to the lost heart
        hearts[lives].classList.add('heart-lost');

        // After the animation, change the heart to a blank heart
        setTimeout(() => {
            hearts[lives].classList.remove('heart-lost');
            hearts[lives].textContent = '🤍'; // Replace with a blank heart
            hearts[lives].classList.add('heart-blank'); // Style the blank heart
        }, 300);
    }

    if (lives === 0) {
        setTimeout(() => {
            alert('Game Over. Better Luck Next Time!');
            resetGame(); // Reset the game after game over
        }, 500);
    }
}

// Function to reset the game
function resetGame() {
    matchedCards = 0;
    flippedCards = [];
    activeScore = 0;
    lives = 6; // Reset lives to 6 on game reset
    gameStarted = false;
    updateScores();
    updateLives(); // Reset lives display to filled hearts

    // Get all the cards on the board and flip them back to the hidden state
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
        card.classList.remove('card-flipped');
        const cardContent = card.querySelector('div');
        cardContent.classList.add('hidden');
    });

    createGameBoard(); // Reinitialize the game board with shuffled cards
}

// Function to start the game
function startGame() {
    if (gameStarted) return; // Prevent starting the game multiple times

    gameStarted = true;
    matchedCards = 0;
    flippedCards = [];
    activeScore = 0;
    lives = 6;
    updateScores();
    updateLives();

    // Show all cards for 5 seconds
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
        card.classList.add('card-flipped');
        const cardContent = card.querySelector('div');
        cardContent.classList.remove('hidden');
    });

    // Flip all cards back after 5 seconds
    setTimeout(() => {
        allCards.forEach(card => {
            card.classList.remove('card-flipped');
            const cardContent = card.querySelector('div');
            cardContent.classList.add('hidden');
        });
    }, 5000);
}

// Event listener for the reset button
document.getElementById('reset-btn').addEventListener('click', resetGame);

// Event listener for the start button
document.getElementById('start-btn').addEventListener('click', startGame);

// Initialize the game
createGameBoard();
updateScores();
updateLives();
