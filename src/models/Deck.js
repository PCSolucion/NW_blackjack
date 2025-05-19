import Card from './Card.js';

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

export default Deck; 