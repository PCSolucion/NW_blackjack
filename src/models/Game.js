import Deck from './Deck.js';
import Card from './Card.js';

class Game {
  constructor() {
    console.log('Inicializando Game...');
    this.deck = new Deck();
    this.playerCards = [];
    this.houseCards = [];
    this.gameState = {
      isAutoFlipInProgress: false,
      playerScore: 0,
      houseScore: 0
    };
    console.log('Game inicializado correctamente');
  }

  dealNewHand() {
    console.log('Repartiendo nueva mano...');
    try {
      if (this.deck.getRemainingCards() < 6) {
        console.log('Reiniciando baraja...');
        this.deck.reset();
        this.deck.shuffle();
      }

      this.playerCards = [];
      this.houseCards = [];
      this.gameState.playerScore = 0;
      this.gameState.houseScore = 0;

      // Repartir 6 cartas (3 para cada jugador)
      for (let i = 0; i < 3; i++) {
        const playerCard = this.deck.deal();
        const houseCard = this.deck.deal();
        
        if (!playerCard || !houseCard) {
          throw new Error('Error al repartir las cartas');
        }

        this.playerCards.push(playerCard);
        this.houseCards.push(houseCard);
        
        console.log(`Carta ${i + 1} repartida - Jugador: ${playerCard.cardString}, Casa: ${houseCard.cardString}`);
      }

      const hand = {
        playerCards: [...this.playerCards],
        houseCards: [...this.houseCards]
      };

      console.log('Mano repartida correctamente:', hand);
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
      const playerScore = this.calculateHandValue(this.playerCards);
      const houseScore = this.calculateHandValue(this.houseCards);

      console.log(`Puntuaciones - Jugador: ${playerScore}, Casa: ${houseScore}`);

      let result;
      if (playerScore > 21) {
        result = { winner: 'house', playerScore, houseScore, isBlackjack: false };
      } else if (houseScore > 21) {
        result = { 
          winner: 'player', 
          playerScore, 
          houseScore, 
          isBlackjack: playerScore === 21 
        };
      } else if (playerScore > houseScore) {
        result = { 
          winner: 'player', 
          playerScore, 
          houseScore, 
          isBlackjack: playerScore === 21 
        };
      } else if (playerScore < houseScore) {
        result = { winner: 'house', playerScore, houseScore, isBlackjack: false };
      } else {
        result = { winner: 'tie', playerScore, houseScore, isBlackjack: false };
      }

      console.log('Ganador determinado:', result);
      return result;
    } catch (error) {
      console.error('Error al determinar ganador:', error);
      return { winner: 'error', playerScore: 0, houseScore: 0, isBlackjack: false };
    }
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

export default Game; 