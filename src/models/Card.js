class Card {
  constructor(suit, value) {
    this.suit = suit;
    this.value = value;
    this.position = this.calculatePosition();
  }

  calculatePosition() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    const suitIndex = suits.indexOf(this.suit);
    const valueIndex = values.indexOf(this.value);
    
    if (suitIndex === -1 || valueIndex === -1) {
      console.error('Valores de carta inválidos:', this.suit, this.value);
      return 0;
    }
    
    return (suitIndex * 13) + valueIndex;
  }

  isAceCard() {
    return this.value === 'A';
  }

  getValue() {
    if (this.isAceCard()) return 11;
    if (['J', 'Q', 'K'].includes(this.value)) return 10;
    return parseInt(this.value);
  }

  toString() {
    return `${this.value} of ${this.suit}`;
  }
} 