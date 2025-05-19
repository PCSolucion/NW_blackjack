class Card {
  constructor(cardString) {
    this.cardString = cardString;
    this.value = this.calculateValue();
    this.suit = this.extractSuit();
    this.isAce = cardString.startsWith("Ace");
    this.position = this.calculatePosition();
    this.placeHolder = null;
    this.flipped = false;
  }

  calculateValue() {
    const cardValues = {
      "Ace": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
      "Jack": 10, "Queen": 10, "King": 10
    };
    const value = this.cardString.split(" of ")[0];
    return cardValues[value];
  }

  extractSuit() {
    return this.cardString.split(" of ")[1];
  }

  calculatePosition() {
    const suitOrder = {
      'Hearts': 0,
      'Diamonds': 1,
      'Clubs': 2,
      'Spades': 3
    };
    return 1 + (suitOrder[this.suit] * 13) + (this.value - 1);
  }

  getValue() {
    return this.value;
  }

  isAceCard() {
    return this.isAce;
  }

  getPosition() {
    return this.position;
  }
}

export default Card; 