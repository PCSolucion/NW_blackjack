class GameUI {
  constructor(game) {
    if (!game) {
      throw new Error('Se requiere una instancia de Game para inicializar GameUI');
    }

    console.log('=== INICIO DE INICIALIZACIÓN DE GAMEUI ===');
    this.game = game;
    
    // Inicializar el sonido
    try {
      this.premioSound = new Audio('https://res.cloudinary.com/pcsolucion/video/upload/v1742121077/premio_bsbuz9.m4a');
      this.premioSound.preload = 'auto';
    } catch (error) {
      console.warn('No se pudo inicializar el sonido:', error);
      this.premioSound = null;
    }

    this.currentHand = null;
    
    // Verificar elementos necesarios
    this.verifyRequiredElements();
    
    // Configurar event listeners
    this.setupEventListeners();

    // Mostrar el historial inicial
    console.log('Mostrando historial inicial...');
    this.updateResultsHistory();
    
    console.log('=== FIN DE INICIALIZACIÓN DE GAMEUI ===');
  }

  verifyRequiredElements() {
    const requiredElements = [
      'dealButton',
      'nextButton',
      'houseScore',
      'playerScore',
      'card1',
      'card2',
      'card3',
      'playerCard1',
      'playerCard2',
      'playerCard3',
      'winnerMessage',
      'resultsContainer'
    ];

    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
      console.error('Elementos faltantes:', missingElements);
      throw new Error('Faltan elementos necesarios en el DOM: ' + missingElements.join(', '));
    }
  }

  setupEventListeners() {
    console.log('Configurando event listeners...');
    const dealButton = document.getElementById('dealButton');
    const nextButton = document.getElementById('nextButton');

    // Limpiar cualquier listener existente
    dealButton.onclick = null;
    nextButton.onclick = null;

    // Configurar nuevos listeners
    dealButton.onclick = () => {
      console.log('Botón de repartir clickeado');
      try {
        this.handleDeal();
      } catch (error) {
        console.error('Error al manejar el reparto:', error);
        alert('Error al repartir las cartas. Por favor, intenta de nuevo.');
      }
    };

    nextButton.onclick = () => {
      console.log('Botón siguiente clickeado');
      try {
        this.handleNext();
      } catch (error) {
        console.error('Error al manejar siguiente:', error);
        alert('Error al pasar a la siguiente mano. Por favor, intenta de nuevo.');
      }
    };

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
        const cardElement = document.getElementById(`playerCard${index + 1}`);
        if (!cardElement) {
          throw new Error(`No se encontró el elemento playerCard${index + 1}`);
        }
        this.displayCard(card, cardElement, false);
      });

      // Mostrar cartas de la casa
      houseCards.forEach((card, index) => {
        console.log(`Mostrando carta de la casa ${index + 1}:`, card);
        const cardElement = document.getElementById(`card${index + 1}`);
        if (!cardElement) {
          throw new Error(`No se encontró el elemento card${index + 1}`);
        }
        this.displayCard(card, cardElement, false);
      });
    } catch (error) {
      console.error('Error al mostrar las cartas:', error);
      throw error;
    }
  }

  displayCard(card, cardElement, flipped) {
    if (!cardElement) {
      throw new Error('Elemento de carta no encontrado');
    }

    const cardInner = cardElement.querySelector('.card-inner');
    const cardFront = cardElement.querySelector('.card-front');
    const cardBack = cardElement.querySelector('.card-back');
    
    if (!cardInner || !cardFront || !cardBack) {
      throw new Error('No se encontraron los elementos necesarios en la carta');
    }

    // Calcular la posición en el sprite de cartas
    const position = card.calculatePosition();
    console.log(`Mostrando carta ${card.toString()} en posición ${position}`);
    
    // Aplicar la posición al fondo de la carta
    cardFront.style.backgroundPositionX = `${-120 * position}px`;
    
    // Asegurar que la carta tenga las clases correctas
    cardElement.classList.add('card');
    cardElement.classList.remove('flipped');
    
    // Aplicar el estado de volteo
    if (flipped) {
      cardElement.classList.add('flipped');
      cardInner.style.transform = 'rotateY(180deg)';
    } else {
      cardInner.style.transform = 'rotateY(0deg)';
    }
    
    // Guardar referencia a la carta en el elemento
    cardElement.card = card;
    cardElement.flipped = flipped;
  }

  flipCard(cardElement) {
    if (!cardElement || !cardElement.card) {
      throw new Error('Elemento de carta inválido para voltear');
    }
    
    const cardInner = cardElement.querySelector('.card-inner');
    if (!cardInner) {
      throw new Error('No se encontró el elemento card-inner');
    }

    cardElement.flipped = !cardElement.flipped;
    cardElement.classList.toggle('flipped');
    cardInner.style.transform = cardElement.flipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
  }

  startAutoFlip() {
    console.log('Iniciando auto flip...');
    if (!this.currentHand) {
      throw new Error('No hay una mano actual para voltear');
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
      throw error;
    }
  }

  flipCardSequence(cards, scoreId, callback) {
    let currentIndex = 0;
    
    const flipNext = () => {
      if (currentIndex >= cards.length) {
        callback();
        return;
      }

      const cardElement = document.getElementById(
        scoreId === 'playerScore' ? `playerCard${currentIndex + 1}` : `card${currentIndex + 1}`
      );

      if (!cardElement) {
        console.error(`No se encontró el elemento para la carta ${currentIndex + 1}`);
        callback();
        return;
      }

      // Asegurarse de que la carta esté visible antes de voltearla
      cardElement.style.visibility = 'visible';
      cardElement.style.opacity = '1';
      
      this.flipCard(cardElement);
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
      // Guardar la puntuación anterior
      const oldScore = parseInt(scoreElement.textContent) || 0;
      
      // Actualizar el texto
      scoreElement.textContent = score;
      
      // Añadir y quitar clase para animación si cambia la puntuación
      if (score !== oldScore) {
        scoreElement.classList.add('active');
        setTimeout(() => {
          scoreElement.classList.remove('active');
        }, 1000);
      }
      
      // Si la puntuación es 21 o se pasa, destacar el marcador
      if (score >= 21) {
        scoreElement.style.fontWeight = '900';
      } else {
        scoreElement.style.fontWeight = '800';
      }
    }
  }

  handleGameEnd() {
    console.log('=== INICIO handleGameEnd ===');
    try {
      const result = this.game.determineWinner();
      console.log('Resultado del juego obtenido:', result);
      
      // Actualizar la UI
      this.displayWinner(result);
      console.log('Mensaje de ganador mostrado');
      
      // Actualizar el historial
      console.log('Intentando actualizar historial...');
      this.updateResultsHistory();
      console.log('Historial actualizado');
      
      this.game.setAutoFlipState(false);
      console.log('=== FIN handleGameEnd ===');
    } catch (error) {
      console.error('Error en handleGameEnd:', error);
      this.game.setAutoFlipState(false);
    }
  }

  updateResultsHistory() {
    console.log('=== INICIO updateResultsHistory ===');
    const resultsContainer = document.getElementById('resultsContainer');
    if (!resultsContainer) {
      console.error('ERROR: No se encontró el contenedor de resultados');
      return;
    }
    console.log('Contenedor de resultados encontrado');

    const results = this.game.getLastResults();
    console.log('Resultados obtenidos del juego:', results);

    // Limpiar el contenedor
    console.log('Limpiando contenedor de resultados');
    resultsContainer.innerHTML = '';

    if (!results || results.length === 0) {
      console.log('No hay resultados para mostrar, agregando mensaje por defecto');
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'result-item empty-message';
      emptyMessage.innerHTML = `
        <div class="result-details">
          <i class="fas fa-history"></i>
          <span>No hay resultados aún</span>
        </div>
      `;
      resultsContainer.appendChild(emptyMessage);
      console.log('=== FIN updateResultsHistory (sin resultados) ===');
      return;
    }

    console.log('Comenzando a renderizar resultados...');
    results.forEach((result, index) => {
      if (!result || !result.winner) {
        console.error('Resultado inválido encontrado:', result);
        return;
      }

      console.log(`Renderizando resultado ${index + 1}:`, result);
      
      const resultItem = document.createElement('div');
      resultItem.className = `result-item ${result.winner}`;

      const icon = document.createElement('i');
      icon.className = `result-icon ${result.winner}`;
      
      // Asignar icono y color según el resultado
      if (result.winner === 'player') {
        icon.className += ' fas fa-trophy';
        icon.style.color = '#4CAF50';
      } else if (result.winner === 'house') {
        icon.className += ' fas fa-times';
        icon.style.color = '#f44336';
      } else {
        icon.className += ' fas fa-equals';
        icon.style.color = '#ffd700';
      }

      const details = document.createElement('div');
      details.className = 'result-details';

      const score = document.createElement('div');
      score.className = 'result-score';
      
      // Agregar indicador de Blackjack si aplica
      const blackjackIndicator = result.isBlackjack ? ' <span class="blackjack-indicator">♠</span>' : '';
      score.innerHTML = `${result.playerScore}${blackjackIndicator} <span>vs</span> ${result.houseScore}`;

      details.appendChild(score);
      resultItem.appendChild(icon);
      resultItem.appendChild(details);
      resultsContainer.appendChild(resultItem);
      console.log(`Resultado ${index + 1} agregado al DOM`);
    });

    // Asegurar que el contenedor sea visible
    resultsContainer.style.display = 'block';
    resultsContainer.style.visibility = 'visible';
    resultsContainer.style.opacity = '1';

    console.log('=== FIN updateResultsHistory ===');
  }

  displayWinner(result) {
    const winnerMessage = document.getElementById('winnerMessage');
    if (!winnerMessage) {
      console.error('No se encontró el elemento winnerMessage');
      return;
    }

    winnerMessage.style.visibility = 'visible';
    
    if (result.winner === 'player') {
      // Si el jugador tiene 21 puntos (isBlackjack = true), mostramos el premio especial
      // De lo contrario, mostramos el premio normal
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