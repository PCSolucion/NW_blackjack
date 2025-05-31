// Clase Deck
class Deck {
  constructor() {
    this.cards = [];
    this.reset();
    this.shuffle();
  }

  reset() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    this.cards = suits.flatMap(suit => 
      values.map(value => new Card(suit, value))
    );
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal() {
    if (this.isEmpty()) {
      this.reset();
      this.shuffle();
    }
    return this.cards.pop();
  }

  isEmpty() {
    return this.cards.length === 0;
  }

  getRemainingCards() {
    return this.cards.length;
  }
}

// Cache de elementos DOM
const DOM_CACHE = {
  dealButton: document.getElementById('dealButton'),
  nextButton: document.getElementById('nextButton'),
  playerScoreElement: document.getElementById('playerScore'),
  houseScoreElement: document.getElementById('houseScore'),
  messageElement: document.getElementById('message'),
  cardElements: {
    player: Array.from({ length: 3 }, (_, i) => ({
      placeholder: document.getElementById(`playerCard${i + 1}`),
      inner: document.getElementById(`playerCard${i + 1}`)?.querySelector('.card-inner'),
      front: document.getElementById(`playerCard${i + 1}`)?.querySelector('.card-front')
    })),
    house: Array.from({ length: 3 }, (_, i) => ({
      placeholder: document.getElementById(`card${i + 1}`),
      inner: document.getElementById(`card${i + 1}`)?.querySelector('.card-inner'),
      front: document.getElementById(`card${i + 1}`)?.querySelector('.card-front')
    }))
  }
};

// Clase Game con optimizaciones
class Game {
  constructor() {
    this.deck = new Deck();
    this.playerCards = [];
    this.houseCards = [];
    this.gameState = {
      isAutoFlipInProgress: false,
      playerScore: 0,
      houseScore: 0
    };
    this._cardValues = new Map([
      ['A', 1], ['2', 2], ['3', 3], ['4', 4], ['5', 5],
      ['6', 6], ['7', 7], ['8', 8], ['9', 9], ['10', 10],
      ['J', 10], ['Q', 10], ['K', 10]
    ]);
  }

  dealNewHand() {
    this.playerCards = Array.from({ length: 3 }, () => this.deck.deal());
    this.houseCards = Array.from({ length: 3 }, () => this.deck.deal());
    this.gameState.playerScore = this.calculateHandValue(this.playerCards);
    this.gameState.houseScore = this.calculateHandValue(this.houseCards);

    return {
      playerCards: this.playerCards,
      houseCards: this.houseCards
    };
  }

  calculateHandValue(cards) {
    let value = 0;
    let aces = 0;

    for (const card of cards) {
      const cardValue = this._cardValues.get(card.value);
      if (card.value === 'A') {
        aces++;
      } else {
        value += cardValue;
      }
    }

    while (aces > 0 && value + 11 <= 21) {
      value += 11;
      aces--;
    }
    value += aces;

    return value;
  }

  determineWinner() {
    const playerScore = this.calculateHandValue(this.playerCards);
    const houseScore = this.calculateHandValue(this.houseCards);

    if (playerScore > 21) {
      return { winner: 'house', playerScore, houseScore, isBlackjack: false };
    }
    if (houseScore > 21) {
      return { 
        winner: 'player', 
        playerScore, 
        houseScore, 
        isBlackjack: playerScore === 21 
      };
    }
    if (playerScore > houseScore) {
      return { 
        winner: 'player', 
        playerScore, 
        houseScore, 
        isBlackjack: playerScore === 21 
      };
    }
    if (playerScore < houseScore) {
      return { winner: 'house', playerScore, houseScore, isBlackjack: false };
    }
    return { winner: 'tie', playerScore, houseScore, isBlackjack: false };
  }

  getGameState() {
    return { ...this.gameState };
  }

  setAutoFlipState(state) {
    this.gameState.isAutoFlipInProgress = state;
  }

  updateScores() {
    this.gameState.playerScore = this.calculateHandValue(this.playerCards);
    this.gameState.houseScore = this.calculateHandValue(this.houseCards);
    return { ...this.gameState };
  }
}

// Clase GameUI con optimizaciones
class GameUI {
  constructor(game) {
    this.game = game;
    this.premioSound = new Audio('https://res.cloudinary.com/pcsolucion/video/upload/v1742121077/premio_bsbuz9.m4a');
    this.premioSound.preload = 'auto';
    this.currentHand = null;
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    DOM_CACHE.dealButton?.addEventListener('click', () => this.handleDeal());
    DOM_CACHE.nextButton?.addEventListener('click', () => this.handleNext());
  }

  handleDeal() {
    if (this.game.getGameState().isAutoFlipInProgress) return;
    
    this.currentHand = this.game.dealNewHand();
    this.displayCards(this.currentHand.playerCards, this.currentHand.houseCards);
    this.resetUI();
    this.startAutoFlip();
  }

  displayCards(playerCards, houseCards) {
    // Mostrar cartas del jugador
    playerCards.forEach((card, index) => {
      this.displayCard(card, index, true);
    });

    // Mostrar cartas de la casa
    houseCards.forEach((card, index) => {
      this.displayCard(card, index, false);
    });
  }

  displayCard(card, index, isPlayer) {
    const cardElements = isPlayer ? DOM_CACHE.cardElements.player[index] : DOM_CACHE.cardElements.house[index];
    if (!cardElements?.front) return;
    
    cardElements.front.style.backgroundPositionX = (-120 * card.getPosition()) + 'px';
    card.placeHolder = cardElements.placeholder;
    card.flipped = false;
    
    if (cardElements.inner) {
      cardElements.inner.style.transform = 'rotateY(0deg)';
    }
  }

  flipCard(card) {
    if (!card.placeHolder) return;
    
    const cardInner = card.placeHolder.querySelector('.card-inner');
    if (!cardInner) return;

    card.flipped = !card.flipped;
    cardInner.style.transform = card.flipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
  }

  startAutoFlip() {
    if (!this.currentHand) return;

    this.game.setAutoFlipState(true);
    
    // Secuencia de volteo de cartas
    this.flipCardSequence(this.currentHand.playerCards, 'playerScore', () => {
      this.flipCardSequence(this.currentHand.houseCards, 'houseScore', () => {
        this.handleGameEnd();
      });
    });
  }

  flipCardSequence(cards, scoreId, callback) {
    let currentIndex = 0;
    
    const flipNext = () => {
      if (currentIndex >= cards.length) {
        callback();
        return;
      }

      this.flipCard(cards[currentIndex]);
      this.updateScore(scoreId, cards.slice(0, currentIndex + 1));
      
      currentIndex++;
      setTimeout(flipNext, currentIndex === cards.length ? 1000 : 500);
    };

    setTimeout(flipNext, 800);
  }

  updateScore(scoreId, cards) {
    const score = this.game.calculateHandValue(cards);
    const scoreElement = document.getElementById(scoreId);
    if (scoreElement) {
      scoreElement.textContent = score;
    }
  }

  handleGameEnd() {
    const result = this.game.determineWinner();
    this.displayWinner(result);
    this.game.setAutoFlipState(false);
  }

  displayWinner(result) {
    const winnerMessage = document.getElementById('winnerMessage');
    if (!winnerMessage) return;

    winnerMessage.style.visibility = 'visible';
    
    if (result.winner === 'player') {
      const prizeElement = result.isBlackjack ? 
        document.getElementById('prize21') : 
        document.getElementById('prizeNormal');
      
      if (prizeElement) {
        prizeElement.classList.add('active');
      }
      this.playPremioSound();
    }
    
    winnerMessage.textContent = this.getWinnerMessage(result);
  }

  getWinnerMessage(result) {
    const messages = {
      player: '¡Ganaste!',
      house: 'La casa gana',
      tie: 'Empate'
    };
    return messages[result.winner] || 'Error: resultado desconocido';
  }

  resetUI() {
    const elements = {
      winnerMessage: document.getElementById('winnerMessage'),
      houseScore: document.getElementById('houseScore'),
      playerScore: document.getElementById('playerScore'),
      prize21: document.getElementById('prize21'),
      prizeNormal: document.getElementById('prizeNormal')
    };

    if (elements.winnerMessage) {
      elements.winnerMessage.style.visibility = 'hidden';
    }
    if (elements.houseScore) {
      elements.houseScore.textContent = '0';
    }
    if (elements.playerScore) {
      elements.playerScore.textContent = '0';
    }
    if (elements.prize21) {
      elements.prize21.classList.remove('active');
    }
    if (elements.prizeNormal) {
      elements.prizeNormal.classList.remove('active');
    }
  }

  playPremioSound() {
    if (this.premioSound) {
      this.premioSound.currentTime = 0;
      this.premioSound.play().catch(error => 
        console.log('Error reproduciendo sonido:', error)
      );
    }
  }

  handleNext() {
    if (this.game.getGameState().isAutoFlipInProgress) return;
    this.handleDeal();
  }
}

// Inicializar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  const gameUI = new GameUI(game);
  
  // Iniciar el primer juego automáticamente
  gameUI.handleDeal();
});