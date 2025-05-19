// Clase Card
class Card {
  constructor(cardString) {
    this.cardString = cardString;
    this.value = this.calculateValue();
    this.suit = this.extractSuit();
    this.isAce = cardString.startsWith("Ace");
    this.position = this.calculatePosition();
    this.placeHolder = null;
    this.flipped = false;
  }

  calculateValue() {
    const cardValues = {
      "Ace": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
      "Jack": 10, "Queen": 10, "King": 10
    };
    const value = this.cardString.split(" of ")[0];
    return cardValues[value];
  }

  extractSuit() {
    return this.cardString.split(" of ")[1];
  }

  calculatePosition() {
    const suitOrder = {
      'Hearts': 0,
      'Diamonds': 1,
      'Clubs': 2,
      'Spades': 3
    };
    return 1 + (suitOrder[this.suit] * 13) + (this.value - 1);
  }

  getValue() {
    return this.value;
  }

  isAceCard() {
    return this.isAce;
  }

  getPosition() {
    return this.position;
  }
}

// Clase Deck
class Deck {
  constructor() {
    this.cards = [];
    this.reset();
    this.shuffle();
  }

  reset() {
    this.cards = [];
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const values = ['Ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'Jack', 'Queen', 'King'];

    for (const suit of suits) {
      for (const value of values) {
        this.cards.push(new Card(`${value} of ${suit}`));
      }
    }
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal() {
    if (this.isEmpty()) {
      throw new Error('No hay más cartas en la baraja');
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

// Clase Game
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
  }

  dealNewHand() {
    if (this.deck.getRemainingCards() < 6) {
      this.deck.reset();
      this.deck.shuffle();
    }

    this.playerCards = [];
    this.houseCards = [];
    this.gameState.playerScore = 0;
    this.gameState.houseScore = 0;

    // Repartir 6 cartas (3 para cada jugador)
    for (let i = 0; i < 3; i++) {
      this.playerCards.push(this.deck.deal());
      this.houseCards.push(this.deck.deal());
    }

    return {
      playerCards: [...this.playerCards],
      houseCards: [...this.houseCards]
    };
  }

  calculateHandValue(cards) {
    let value = 0;
    let aces = 0;

    for (const card of cards) {
      if (card.isAceCard()) {
        aces++;
        value += 1;
      } else {
        value += card.getValue();
      }
    }

    // Ajustar el valor de los ases si es beneficioso
    while (aces > 0 && value + 10 <= 21) {
      value += 10;
      aces--;
    }

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

// Clase GameUI
class GameUI {
  constructor(game) {
    this.game = game;
    this.premioSound = new Audio('https://res.cloudinary.com/pcsolucion/video/upload/v1742121077/premio_bsbuz9.m4a');
    this.premioSound.preload = 'auto';
    this.currentHand = null;
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    const dealButton = document.getElementById('dealButton');
    const nextButton = document.getElementById('nextButton');

    if (dealButton) {
      dealButton.addEventListener('click', () => this.handleDeal());
    }
    if (nextButton) {
      nextButton.addEventListener('click', () => this.handleNext());
    }
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
      this.displayCard(card, `playerCard${index + 1}`, false);
    });

    // Mostrar cartas de la casa
    houseCards.forEach((card, index) => {
      this.displayCard(card, `card${index + 1}`, false);
    });
  }

  displayCard(card, placeHolderId, flipped) {
    const placeHolder = document.getElementById(placeHolderId);
    if (!placeHolder) return;

    const cardInner = placeHolder.querySelector('.card-inner');
    const cardFront = placeHolder.querySelector('.card-front');
    
    if (!cardInner || !cardFront) return;
    
    cardFront.style.backgroundPositionX = (-120 * card.getPosition()) + 'px';
    card.placeHolder = placeHolder;
    card.flipped = flipped;
    
    cardInner.style.transform = flipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
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