class GameUI {
  constructor(game) {
    console.log('Inicializando GameUI...');
    this.game = game;
    this.premioSound = new Audio('https://res.cloudinary.com/pcsolucion/video/upload/v1742121077/premio_bsbuz9.m4a');
    this.premioSound.preload = 'auto';
    this.currentHand = null;
    this.initializeEventListeners();
    console.log('GameUI inicializada correctamente');
  }

  initializeEventListeners() {
    console.log('Configurando event listeners...');
    const dealButton = document.getElementById('dealButton');
    const nextButton = document.getElementById('nextButton');

    if (!dealButton || !nextButton) {
      console.error('No se encontraron los botones necesarios');
      return;
    }

    // Remover listeners existentes para evitar duplicados
    dealButton.removeEventListener('click', this.handleDeal);
    nextButton.removeEventListener('click', this.handleNext);

    // Agregar nuevos listeners
    dealButton.addEventListener('click', () => {
      console.log('Botón de repartir clickeado');
      this.handleDeal();
    });

    nextButton.addEventListener('click', () => {
      console.log('Botón siguiente clickeado');
      this.handleNext();
    });

    console.log('Event listeners configurados correctamente');
  }

  handleDeal() {
    console.log('Manejando reparto de cartas...');
    if (this.game.getGameState().isAutoFlipInProgress) {
      console.log('AutoFlip en progreso, ignorando click');
      return;
    }
    
    try {
      this.currentHand = this.game.dealNewHand();
      console.log('Nueva mano repartida:', this.currentHand);
      
      this.displayCards(this.currentHand.playerCards, this.currentHand.houseCards);
      this.resetUI();
      this.startAutoFlip();
    } catch (error) {
      console.error('Error al repartir cartas:', error);
      alert('Error al repartir las cartas. Por favor, intenta de nuevo.');
    }
  }

  displayCards(playerCards, houseCards) {
    console.log('Mostrando cartas...');
    try {
      // Mostrar cartas del jugador
      playerCards.forEach((card, index) => {
        console.log(`Mostrando carta del jugador ${index + 1}:`, card);
        this.displayCard(card, `playerCard${index + 1}`, false);
      });

      // Mostrar cartas de la casa
      houseCards.forEach((card, index) => {
        console.log(`Mostrando carta de la casa ${index + 1}:`, card);
        this.displayCard(card, `card${index + 1}`, false);
      });
    } catch (error) {
      console.error('Error al mostrar las cartas:', error);
      throw error;
    }
  }

  displayCard(card, placeHolderId, flipped) {
    const placeHolder = document.getElementById(placeHolderId);
    if (!placeHolder) {
      console.error(`No se encontró el elemento con id ${placeHolderId}`);
      return;
    }

    const cardInner = placeHolder.querySelector('.card-inner');
    const cardFront = placeHolder.querySelector('.card-front');
    
    if (!cardInner || !cardFront) {
      console.error(`No se encontraron los elementos necesarios en ${placeHolderId}`);
      return;
    }
    
    cardFront.style.backgroundPositionX = (-120 * card.getPosition()) + 'px';
    card.placeHolder = placeHolder;
    card.flipped = flipped;
    
    cardInner.style.transform = flipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
  }

  flipCard(card) {
    if (!card.placeHolder) {
      console.error('La carta no tiene un placeHolder asignado');
      return;
    }
    
    const cardInner = card.placeHolder.querySelector('.card-inner');
    if (!cardInner) {
      console.error('No se encontró el elemento card-inner');
      return;
    }

    card.flipped = !card.flipped;
    cardInner.style.transform = card.flipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
  }

  startAutoFlip() {
    console.log('Iniciando auto flip...');
    if (!this.currentHand) {
      console.error('No hay una mano actual para voltear');
      return;
    }

    try {
      this.game.setAutoFlipState(true);
      console.log('Estado de auto flip actualizado');
      
      // Secuencia de volteo de cartas
      this.flipCardSequence(this.currentHand.playerCards, 'playerScore', () => {
        console.log('Secuencia de cartas del jugador completada');
        this.flipCardSequence(this.currentHand.houseCards, 'houseScore', () => {
          console.log('Secuencia de cartas de la casa completada');
          this.handleGameEnd();
        });
      });
    } catch (error) {
      console.error('Error en auto flip:', error);
      this.game.setAutoFlipState(false);
      alert('Error al voltear las cartas. Por favor, intenta de nuevo.');
    }
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
    if (!winnerMessage) {
      console.error('No se encontró el elemento winnerMessage');
      return;
    }

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

export default GameUI; 