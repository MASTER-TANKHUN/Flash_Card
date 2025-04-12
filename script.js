const wordInput = document.getElementById('word-input');
const answerInput = document.getElementById('answer-input');
const addCardBtn = document.getElementById('add-card-btn');
const cardList = document.getElementById('card-list');
const cardCount = document.getElementById('card-count');
const startGameBtn = document.getElementById('start-game-btn');
const currentWord = document.getElementById('current-word');
const optionsContainer = document.getElementById('options-container');
const scoreEl = document.getElementById('score');
const totalEl = document.getElementById('total');
const nextBtn = document.getElementById('next-btn');
const finishBtn = document.getElementById('finish-btn');
const finalScoreEl = document.getElementById('final-score');
const finalTotalEl = document.getElementById('final-total');
const percentageEl = document.getElementById('percentage');
const playAgainBtn = document.getElementById('play-again-btn');
const createTab = document.getElementById('create-tab');
const playTab = document.getElementById('play-tab');
const createSection = document.getElementById('create-section');
const playSection = document.getElementById('play-section');
const gameIntro = document.getElementById('game-intro');
const gameArea = document.getElementById('game-area');
const gameResults = document.getElementById('game-results');
const emptyState = document.getElementById('empty-state');
const notification = document.getElementById('notification');
const gameInstruction = document.getElementById('game-instruction');
const loadSamplesBtn = document.getElementById('load-samples-btn');
let cards = [];
let currentCardIndex = 0;
let score = 0;
let shuffledCards = [];
const MIN_CARDS = 5;

const sampleCards = [
    { word: "Apple", answer: "A fruit that grows on trees" },
    { word: "Photosynthesis", answer: "Process by which plants make food" },
    { word: "Mitochondria", answer: "Powerhouse of the cell" },
    { word: "HTML", answer: "Hypertext Markup Language" },
    { word: "Algorithm", answer: "Step-by-step procedure to solve a problem" },
    { word: "Gravity", answer: "Force that attracts objects toward Earth" },
    { word: "Democracy", answer: "Government by the people" }
];

addCardBtn.addEventListener('click', addCard);
startGameBtn.addEventListener('click', startGame);
nextBtn.addEventListener('click', nextCard);
finishBtn.addEventListener('click', showResults);
playAgainBtn.addEventListener('click', restartGame);
loadSamplesBtn.addEventListener('click', loadSampleCards);
answerInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addCard();
    }
});

createTab.addEventListener('click', () => {
    createTab.classList.add('active');
    playTab.classList.remove('active');
    createSection.classList.remove('hidden');
    playSection.classList.add('hidden');
});

playTab.addEventListener('click', () => {
    playTab.classList.add('active');
    createTab.classList.remove('active');
    playSection.classList.remove('hidden');
    createSection.classList.add('hidden');

    updateGameInstructions();
});

function addCard() {
    const word = wordInput.value.trim();
    const answer = answerInput.value.trim();
    
    if (word && answer) {
        const isDuplicateWord = cards.some(card => card.word.toLowerCase() === word.toLowerCase());
        
        if (isDuplicateWord) {
            showNotification('This word/question already exists!', 'alert-danger');
            return;
        }
        
        cards.push({ word, answer });
        updateCardList();
        updateCardCount();

        wordInput.value = '';
        answerInput.value = '';
        wordInput.focus();

        showNotification('Card added successfully!', 'alert-success');

        updateGameInstructions();
    } else {
        showNotification('Please enter both a word/question and an answer.', 'alert-danger');
    }
}

function deleteCard(index) {
    cards.splice(index, 1);
    updateCardList();
    updateCardCount();
    updateGameInstructions();
    showNotification('Card deleted!', 'alert-success');
}

function updateCardList() {
    cardList.innerHTML = '';
    
    if (cards.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    cards.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.innerHTML = `
            <div class="card-content">
                <strong>${escapeHTML(card.word)}</strong>: ${escapeHTML(card.answer)}
            </div>
            <button class="delete-btn" data-index="${index}" aria-label="Delete card">×</button>
        `;
        cardList.appendChild(cardEl);
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            deleteCard(index);
        });
    });
}

function updateCardCount() {
    cardCount.textContent = cards.length;
}

function loadSampleCards() {
    cards = [...sampleCards];
    updateCardList();
    updateCardCount();
    updateGameInstructions();
    showNotification('Sample cards loaded!', 'alert-success');
}

function startGame() {
    if (cards.length < MIN_CARDS) {
        showNotification(`You need at least ${MIN_CARDS} cards to play.`, 'alert-danger');
        return;
    }
    shuffledCards = [...cards].sort(() => Math.random() - 0.5);
    currentCardIndex = 0;
    score = 0;
    gameIntro.classList.add('hidden');
    gameArea.classList.remove('hidden');
    gameResults.classList.add('hidden');
    nextBtn.classList.add('hidden');
    finishBtn.classList.add('hidden');
    displayCard();
    scoreEl.textContent = score;
    totalEl.textContent = shuffledCards.length;
}

function displayCard() {
    const currentCard = shuffledCards[currentCardIndex];
    currentWord.textContent = currentCard.word;
    let options = [currentCard.answer];
    const otherCards = cards.filter(card => card.answer.toLowerCase() !== currentCard.answer.toLowerCase());
    const totalOptions = Math.min(4, cards.length);
    const numOptionsNeeded = totalOptions - 1;
    const shuffledOtherCards = [...otherCards].sort(() => Math.random() - 0.5);
    for (let i = 0; i < numOptionsNeeded && i < shuffledOtherCards.length; i++) {
        options.push(shuffledOtherCards[i].answer);
    }
    options = options.sort(() => Math.random() - 0.5);
    optionsContainer.innerHTML = '';
    options.forEach(option => {
        const optionEl = document.createElement('div');
        optionEl.className = 'option';
        optionEl.textContent = option;
        optionEl.addEventListener('click', () => selectOption(option, currentCard.answer, optionEl));
        optionsContainer.appendChild(optionEl);
    });
}

function selectOption(selectedAnswer, correctAnswer, optionEl) {
    document.querySelectorAll('.option').forEach(option => {
        option.style.pointerEvents = 'none';
    });
    
    if (selectedAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        optionEl.classList.add('correct');
        score++;
        scoreEl.textContent = score;
    } else {
        optionEl.classList.add('incorrect');
        document.querySelectorAll('.option').forEach(option => {
            if (option.textContent.toLowerCase() === correctAnswer.toLowerCase()) {
                option.classList.add('correct');
            }
        });
    }

    if (currentCardIndex < shuffledCards.length - 1) {
        nextBtn.classList.remove('hidden');
    } else {
        finishBtn.classList.remove('hidden');
    }
}

function nextCard() {
    currentCardIndex++;
    nextBtn.classList.add('hidden');
    displayCard();
}

function showResults() {
    gameArea.classList.add('hidden');
    gameResults.classList.remove('hidden');
    finalScoreEl.textContent = score;
    finalTotalEl.textContent = shuffledCards.length;
    const percentage = Math.round((score / shuffledCards.length) * 100);
    percentageEl.textContent = percentage;
}

function restartGame() {
    gameResults.classList.add('hidden');
    gameIntro.classList.remove('hidden');
}

function showNotification(message, className) {
    notification.textContent = message;
    notification.className = 'alert ' + className;
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

function updateGameInstructions() {
    const cardsNeeded = Math.max(0, MIN_CARDS - cards.length);
    
    if (cardsNeeded > 0) {
        gameInstruction.textContent = `You need ${cardsNeeded} more card${cardsNeeded === 1 ? '' : 's'} to play.`;
        startGameBtn.disabled = true;
    } else {
        gameInstruction.textContent = `You have ${cards.length} cards. Ready to test your knowledge?`;
        startGameBtn.disabled = false;
    }
}
function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

updateGameInstructions();