class GameUI {
  constructor(game) {
    if (!game) {
      throw new Error('Se requiere una instancia de Game para inicializar GameUI');
    }

    console.log('=== INICIO DE INICIALIZACIÓN DE GAMEUI ===');
    this.game = game;
    
    // Inicializar los sonidos
    try {
      this.premioSound = new Audio('https://res.cloudinary.com/pcsolucion/video/upload/v1742121077/premio_bsbuz9.m4a');
      this.premioSound.preload = 'auto';
      
      // Sonido de carta
      this.cardSound = new Audio('sounds/sonidocarta.mp3');
      this.cardSound.preload = 'auto';
      this.cardSound.volume = 0.5; // Ajustar volumen al 50%
    } catch (error) {
      console.warn('No se pudo inicializar el sonido:', error);
      this.premioSound = null;
      this.cardSound = null;
    }

    this.currentHand = null;
    this.loopMode = false; // Modo bucle desactivado por defecto
    
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
      console.log('Botón Loop clickeado');
      try {
        // Cambiar el modo loop
        this.loopMode = !this.loopMode;
        
        // Actualizar la apariencia del botón según el estado
        if (this.loopMode) {
          dealButton.classList.add('active-loop');
          dealButton.querySelector('i').classList.add('fa-spin');
          dealButton.title = 'Desactivar modo bucle';
          
          // Si no hay un juego en progreso, comenzar uno
          if (!this.game.getGameState().isAutoFlipInProgress) {
            this.handleDeal();
          }
        } else {
          dealButton.classList.remove('active-loop');
          dealButton.querySelector('i').classList.remove('fa-spin');
          dealButton.title = 'Activar modo bucle';
        }
      } catch (error) {
        console.error('Error al manejar el modo loop:', error);
        alert('Error al cambiar el modo de juego. Por favor, intenta de nuevo.');
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

    // Agregar evento para recargar página
    window.addEventListener('beforeunload', () => {
      this.loopMode = false; // Asegurar que el loop se detenga al recargar
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
      // Reiniciar todas las cartas para el nuevo reparto
      document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('dealing', 'player-dealing', 'house-dealing');
        const cardFront = card.querySelector('.card-front');
        if (cardFront) {
          cardFront.classList.remove('win-effect', 'lose-effect');
        }
      });

      // Mostrar cartas del jugador con retraso para la animación
      playerCards.forEach((card, index) => {
        console.log(`Mostrando carta del jugador ${index + 1}:`, card);
        const cardElement = document.getElementById(`playerCard${index + 1}`);
        if (!cardElement) {
          throw new Error(`No se encontró el elemento playerCard${index + 1}`);
        }
        
        // Limpiar estilos y aplicar animación
        cardElement.style.opacity = '0';
        
        // Retrasar cada carta para crear secuencia
        setTimeout(() => {
          this.displayCard(card, cardElement, false);
          cardElement.classList.add('dealing', 'player-dealing');
          cardElement.style.opacity = '1';
          cardElement.style.animationDelay = `${index * 0.2}s`;
          // Ya no reproducimos sonido durante el reparto
        }, 300 + index * 200); // Pequeño retraso inicial + incremento por carta
      });

      // Mostrar cartas de la casa con retraso
      houseCards.forEach((card, index) => {
        console.log(`Mostrando carta de la casa ${index + 1}:`, card);
        const cardElement = document.getElementById(`card${index + 1}`);
        if (!cardElement) {
          throw new Error(`No se encontró el elemento card${index + 1}`);
        }
        
        // Limpiar estilos y aplicar animación
        cardElement.style.opacity = '0';
        
        // Retrasar cada carta para crear secuencia después de las del jugador
        setTimeout(() => {
          this.displayCard(card, cardElement, false);
          cardElement.classList.add('dealing', 'house-dealing');
          cardElement.style.opacity = '1';
          cardElement.style.animationDelay = `${index * 0.2}s`;
          // Ya no reproducimos sonido durante el reparto
        }, 1200 + index * 200); // Retraso mayor para comenzar después del jugador
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
      
      // Esperar a que terminen las animaciones de reparto antes de iniciar el volteo
      // 2000ms para dar tiempo a que todas las cartas terminen de repartirse
      setTimeout(() => {
        // Secuencia de volteo de cartas
        this.flipCardSequence(this.currentHand.playerCards, 'playerScore', () => {
          console.log('Secuencia de cartas del jugador completada');
          this.flipCardSequence(this.currentHand.houseCards, 'houseScore', () => {
            console.log('Secuencia de cartas de la casa completada');
            this.handleGameEnd();
          });
        });
      }, 2000);
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
      
      // Primero reproducimos el sonido al voltear cada carta
      this.playCardSound();
      
      // Luego volteamos la carta
      this.flipCard(cardElement);
      
      // Y actualizamos la puntuación
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
      
      // Añadir efectos visuales basados en el resultado
      this.applyResultEffects(result);
      
      // Actualizar el historial y estadísticas 
      console.log('Intentando actualizar historial...');
      this.updateResultsHistory();
      console.log('Historial actualizado');
      
      this.game.setAutoFlipState(false);
      
      // Si el resultado es un empate o está en modo loop, reiniciar automáticamente
      if (result.winner === 'tie' || this.loopMode) {
        // Determinar el tiempo de espera según el resultado y el modo
        let delay = 3000; // Tiempo base para modo loop
        
        if (result.winner === 'tie') {
          delay = 2000; // Empates se procesan más rápido
          console.log('Empate detectado, reiniciando juego en', delay, 'ms');
        } else {
          console.log('Modo bucle activo, siguiente juego en', delay, 'ms');
        }
        
        setTimeout(() => {
          // Verificar que seguimos en modo bucle o fue empate
          if (this.loopMode || result.winner === 'tie') {
            console.log('Iniciando nueva partida automáticamente');
            this.handleDeal(); // Iniciar nueva partida
          }
        }, delay);
      }
      
      console.log('=== FIN handleGameEnd ===');
    } catch (error) {
      console.error('Error en handleGameEnd:', error);
      this.game.setAutoFlipState(false);
    }
  }
  
  applyResultEffects(result) {
    console.log('Aplicando efectos visuales al resultado');
    try {
      // Seleccionamos todas las cartas volteadas del jugador
      const playerCards = document.querySelectorAll('#playerCards .card.flipped');
      // Seleccionamos todas las cartas volteadas de la casa
      const houseCards = document.querySelectorAll('#board .card.flipped');
      
      if (result.winner === 'player') {
        // Efecto de victoria para cartas del jugador
        playerCards.forEach((card, index) => {
          const cardFront = card.querySelector('.card-front');
          if (cardFront) {
            // Añadir retraso para que los efectos sean secuenciales
            setTimeout(() => {
              cardFront.classList.add('win-effect');
            }, index * 200);
          }
        });
        
        // Efecto de derrota para cartas de la casa
        houseCards.forEach((card, index) => {
          const cardFront = card.querySelector('.card-front');
          if (cardFront) {
            setTimeout(() => {
              cardFront.classList.add('lose-effect');
            }, 800 + index * 150);
          }
        });
      } else if (result.winner === 'house') {
        // Efecto de victoria para cartas de la casa
        houseCards.forEach((card, index) => {
          const cardFront = card.querySelector('.card-front');
          if (cardFront) {
            setTimeout(() => {
              cardFront.classList.add('win-effect');
            }, index * 200);
          }
        });
        
        // Efecto de derrota para cartas del jugador
        playerCards.forEach((card, index) => {
          const cardFront = card.querySelector('.card-front');
          if (cardFront) {
            setTimeout(() => {
              cardFront.classList.add('lose-effect');
            }, 800 + index * 150);
          }
        });
      } 
      // Para empate no añadimos efectos especiales
      
    } catch (error) {
      console.error('Error al aplicar efectos visuales:', error);
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

    // Obtenemos las estadísticas globales
    const globalStats = this.game.getGlobalStats();
    console.log('Estadísticas globales obtenidas:', globalStats);
    
    // Actualizamos el título de la sección para mostrar el ratio global
    const historyTitle = document.querySelector('.results-history h3');
    if (historyTitle) {
      const totalGames = globalStats.totalGames || 0;
      const playerWins = globalStats.playerWins || 0;
      
      // Calcular el ratio de victorias
      const winRate = totalGames > 0 ? Math.round((playerWins / totalGames) * 100) : 0;
      console.log(`Calculando winrate: ${playerWins} victorias / ${totalGames} partidas = ${winRate}%`);
      
      historyTitle.innerHTML = `
        <i class="fas fa-history"></i> Últimos Resultados 
        <span class="global-stats">
          <span class="win-rate-label">winratio</span> <span class="win-rate ${winRate >= 50 ? 'positive' : 'negative'}">${winRate}%</span>
          <button id="resetStatsButton" class="reset-stats-button" title="Reiniciar estadísticas">
            <i class="fas fa-redo-alt"></i>
          </button>
        </span>
      `;
      
      // Agregamos la barra de progreso para mostrar el ratio visualmente
      const progressBarContainer = document.createElement('div');
      progressBarContainer.className = 'winrate-bar-container';
      
      // Barra de progreso de victorias (verde)
      const winBar = document.createElement('div');
      winBar.className = 'winrate-bar win';
      winBar.style.width = `${winRate}%`;
      
      // Barra de progreso de derrotas (roja)
      const loseBar = document.createElement('div');
      loseBar.className = 'winrate-bar lose';
      loseBar.style.width = `${100 - winRate}%`;
      
      // Añadimos las barras al contenedor
      progressBarContainer.appendChild(winBar);
      progressBarContainer.appendChild(loseBar);
      
      // Añadimos el contenedor después del título
      historyTitle.appendChild(progressBarContainer);
      
      // Añadir event listener al botón de reset
      setTimeout(() => {
        const resetButton = document.getElementById('resetStatsButton');
        if (resetButton) {
          resetButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar propagación del evento
            this.resetGlobalStats();
          });
        }
      }, 0);
    }

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
        console.log('Error reproduciendo sonido de premio:', error)
      );
    }
  }
  
  playCardSound() {
    if (this.cardSound) {
      this.cardSound.currentTime = 0;
      this.cardSound.play().catch(error => 
        console.log('Error reproduciendo sonido de carta:', error)
      );
    }
  }

  handleNext() {
    if (this.game.getGameState().isAutoFlipInProgress) return;
    this.handleDeal();
  }

  resetGlobalStats() {
    console.log('Reiniciando estadísticas globales...');
    // Restablecer estadísticas en el objeto Game
    this.game.globalStats = {
      totalGames: 0,
      playerWins: 0,
      houseWins: 0,
      ties: 0,
      blackjacks: 0
    };
    
    // Guardar estadísticas reseteadas en localStorage
    this.game.saveGlobalStats();
    
    // Actualizar la interfaz
    this.updateResultsHistory();
    
    console.log('Estadísticas globales reiniciadas');
  }
} 