class Deck {
  constructor() {
    this.cards = [];
    this.initializeDeck();
  }

  initializeDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    // Limpiar el array de cartas
    this.cards = [];
    
    // Crear todas las cartas
    for (let suit of suits) {
      for (let value of values) {
        this.cards.push(new Card(suit, value));
      }
    }
  }

  shuffle() {
    console.log('Barajando la baraja...');
    // Usar el algoritmo Fisher-Yates para un barajado más aleatorio
    for (let i = this.cards.length - 1; i > 0; i--) {
      // Usar Math.random() con una semilla basada en el tiempo actual
      const j = Math.floor((Math.random() * (i + 1)) * (Date.now() % 1000) / 1000);
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
    console.log('Baraja barajada. Cartas restantes:', this.cards.length);
  }

  drawCard() {
    if (this.cards.length === 0) {
      console.log('Baraja vacía, reinicializando...');
      this.initializeDeck();
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