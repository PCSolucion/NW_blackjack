class Card {
  constructor(suit, value) {
    this.suit = suit.toLowerCase();
    this.value = value.toUpperCase();
    this.position = this.calculatePosition();
    console.log(`Carta creada: ${this.toString()} (valor: ${this.value}, posición: ${this.position})`);
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
    
    // La primera posición (0) es el dorso, por lo que todas las cartas se desplazan 1 posición
    // Fórmula: (suitIndex * 13) + valueIndex + 1 (el +1 es por el dorso al inicio)
    return (suitIndex * 13) + valueIndex + 1;
  }

  isAceCard() {
    return this.value === 'A';
  }

  isFaceCard() {
    return ['J', 'Q', 'K'].includes(this.value);
  }

  getNumericValue() {
    if (this.isFaceCard()) {
      return 10;
    }
    if (this.isAceCard()) {
      return 1; // Valor base del as
    }
    return Number(this.value);
  }

  getPosition() {
    return this.position;
  }

  getValue() {
    const numericValue = this.getNumericValue();
    console.log(`Obteniendo valor para ${this.toString()}:`);
    console.log(`- Valor numérico base: ${numericValue}`);
    console.log(`- Es as: ${this.isAceCard()}`);
    console.log(`- Es figura: ${this.isFaceCard()}`);
    return numericValue;
  }

  toString() {
    const valueMap = {
      'A': 'As',
      'J': 'Jota',
      'Q': 'Reina',
      'K': 'Rey'
    };
    const displayValue = valueMap[this.value] || this.value;
    return `${displayValue} de ${this.suit}`;
  }
} 