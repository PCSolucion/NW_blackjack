class Game {
  constructor() {
    console.log('Inicializando Game...');
    this.deck = new Deck();
    this.deck.shuffle(); // Asegurar que la baraja esté barajada al inicio
    this.playerCards = [];
    this.houseCards = [];
    this.gameState = {
      isAutoFlipInProgress: false,
      currentHand: null
    };
    this.lastResults = this.loadResults(); // Cargar resultados guardados
    console.log('Game inicializado correctamente');
  }

  dealNewHand() {
    console.log('Repartiendo nueva mano...');
    try {
      // Verificar si necesitamos una nueva baraja
      if (this.deck.getRemainingCards() < 6) {
        console.log('Creando nueva baraja...');
        this.deck = new Deck();
        this.deck.shuffle();
      }

      this.playerCards = [];
      this.houseCards = [];
      this.gameState.playerScore = 0;
      this.gameState.houseScore = 0;

      // Repartir 6 cartas (3 para cada jugador)
      for (let i = 0; i < 3; i++) {
        const playerCard = this.deck.drawCard();
        const houseCard = this.deck.drawCard();
        
        if (!playerCard || !houseCard) {
          throw new Error('Error al repartir las cartas');
        }

        this.playerCards.push(playerCard);
        this.houseCards.push(houseCard);
        
        console.log(`Carta ${i + 1} repartida - Jugador: ${playerCard.toString()}, Casa: ${houseCard.toString()}`);
      }

      const hand = {
        playerCards: [...this.playerCards],
        houseCards: [...this.houseCards]
      };

      console.log('Mano repartida correctamente:', hand);
      this.gameState.currentHand = hand;
      return hand;

    } catch (error) {
      console.error('Error al repartir nueva mano:', error);
      throw new Error('No se pudo repartir la mano: ' + error.message);
    }
  }

  calculateHandValue(cards) {
    try {
      let value = 0;
      let aces = 0;

      for (const card of cards) {
        if (!card) {
          console.error('Carta inválida en el cálculo de valor');
          continue;
        }

        if (card.isAceCard()) {
          // Contar los ases como 1 inicialmente
          aces++;
          value += 1;
        } else if (card.isFaceCard()) {
          // J, Q, K valen 10
          value += 10;
        } else {
          // Cartas numéricas valen su número
          value += parseInt(card.value);
        }
      }

      // Ajustar el valor de los ases para obtener la mejor puntuación posible
      // Los ases pueden valer 1 u 11, elegimos 11 si no nos pasamos de 21
      while (aces > 0 && value + 10 <= 21) {
        value += 10;
        aces--;
      }

      console.log(`Valor calculado para ${cards.length} cartas: ${value}`);
      return value;
    } catch (error) {
      console.error('Error al calcular valor de la mano:', error);
      return 0;
    }
  }

  determineWinner() {
    console.log('Determinando ganador...');
    try {
      const { playerCards, houseCards } = this.gameState.currentHand;
      const playerScore = this.calculateHandValue(playerCards);
      const houseScore = this.calculateHandValue(houseCards);

      // Actualizar los scores en el estado del juego
      this.gameState.playerScore = playerScore;
      this.gameState.houseScore = houseScore;

      console.log(`Puntuaciones - Jugador: ${playerScore}, Casa: ${houseScore}`);

      let winner;
      let isBlackjack = false;

      if (playerScore > 21) {
        winner = 'house';
      } else if (houseScore > 21) {
        winner = 'player';
      } else if (playerScore === houseScore) {
        winner = 'tie';
      } else {
        winner = playerScore > houseScore ? 'player' : 'house';
      }

      // Verificar si el jugador tiene 21 puntos (para activar el premio especial)
      // Un blackjack clásico es con 2 cartas, pero para el premio queremos cualquier combinación que sume 21
      if (winner === 'player' && playerScore === 21) {
        isBlackjack = true;
      }

      const result = {
        winner,
        playerScore,
        houseScore,
        isBlackjack,
        timestamp: new Date().getTime() // Agregar timestamp para debugging
      };

      // Agregar el resultado al historial
      console.log('Agregando resultado al historial:', result);
      this.addResult(result);

      // Verificar que el resultado se agregó correctamente
      console.log('Estado actual del historial:', this.lastResults);
      console.log('Número total de resultados:', this.lastResults.length);

      return result;
    } catch (error) {
      console.error('Error al determinar ganador:', error);
      return { winner: 'error', playerScore: 0, houseScore: 0, isBlackjack: false };
    }
  }

  addResult(result) {
    if (!result || !result.winner) {
      console.error('Intento de agregar resultado inválido:', result);
      return;
    }

    console.log('Agregando nuevo resultado:', result);
    
    // Crear una copia del resultado para evitar referencias
    const resultCopy = {
      winner: result.winner,
      playerScore: result.playerScore,
      houseScore: result.houseScore,
      isBlackjack: result.isBlackjack,
      timestamp: result.timestamp || new Date().getTime()
    };

    // Agregar al inicio del array
    this.lastResults.unshift(resultCopy);
    
    // Mantener solo los últimos 5 resultados
    if (this.lastResults.length > 5) {
      this.lastResults.pop();
    }

    // Guardar resultados en localStorage
    this.saveResults();

    console.log('Historial actualizado. Total de resultados:', this.lastResults.length);
    console.log('Contenido actual del historial:', this.lastResults);
  }

  saveResults() {
    try {
      localStorage.setItem('blackjackResults', JSON.stringify(this.lastResults));
      console.log('Resultados guardados en localStorage');
    } catch (error) {
      console.error('Error al guardar resultados:', error);
    }
  }

  loadResults() {
    try {
      const savedResults = localStorage.getItem('blackjackResults');
      if (savedResults) {
        const results = JSON.parse(savedResults);
        console.log('Resultados cargados de localStorage:', results);
        return results;
      }
    } catch (error) {
      console.error('Error al cargar resultados:', error);
    }
    return [];
  }

  getLastResults() {
    console.log('Obteniendo últimos resultados. Total:', this.lastResults.length);
    // Devolver una copia profunda del array
    return this.lastResults.map(result => ({...result}));
  }

  getGameState() {
    return { ...this.gameState };
  }

  setAutoFlipState(state) {
    console.log(`Cambiando estado de auto flip a: ${state}`);
    this.gameState.isAutoFlipInProgress = state;
  }

  updateScores() {
    try {
      this.gameState.playerScore = this.calculateHandValue(this.playerCards);
      this.gameState.houseScore = this.calculateHandValue(this.houseCards);
      console.log('Puntuaciones actualizadas:', this.gameState);
      return { ...this.gameState };
    } catch (error) {
      console.error('Error al actualizar puntuaciones:', error);
      return this.gameState;
    }
  }
} 