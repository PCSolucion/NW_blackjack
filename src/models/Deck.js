class Deck {
  constructor() {
    console.log('=== INICIO CREACIÓN DE BARAJA ===');
    this.cards = [];
    this.initializeDeck();
    console.log('=== FIN CREACIÓN DE BARAJA ===');
  }

  initializeDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    console.log('Inicializando baraja con:');
    console.log('- Palos:', suits);
    console.log('- Valores:', values);
    
    // Limpiar el array de cartas
    this.cards = [];
    
    // Crear todas las cartas
    for (let suit of suits) {
      for (let value of values) {
        const card = new Card(suit, value);
        console.log(`Carta creada: ${card.toString()}`);
        this.cards.push(card);
      }
    }

    console.log(`Total de cartas creadas: ${this.cards.length}`);
  }

  shuffle() {
    console.log('Barajando la baraja...');
    // Usar el algoritmo Fisher-Yates para un barajado más aleatorio
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
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
    const card = this.cards.pop();
    console.log(`Carta extraída: ${card.toString()}`);
    return card;
  }

  isEmpty() {
    return this.cards.length === 0;
  }

  getRemainingCards() {
    return this.cards.length;
  }
} 