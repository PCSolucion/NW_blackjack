class Deck {
  constructor() {
    this.deck = [];
    this.reset(); // Añade 52 cartas a la baraja
    this.shuffle(); // Baraja las cartas
  }

  reset() {
    this.deck = [];
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const values = ['Ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'Jack', 'Queen', 'King'];

    for (let suit of suits) {
      for (let value of values) {
        this.deck.push(value + " of " + suit);
      }
    }
  }

  shuffle() {
    let numberOfCards = this.deck.length;  
    for (let i = 0; i < numberOfCards; i++) {
      let j = Math.floor(Math.random() * numberOfCards);
      let tmp = this.deck[i];
      this.deck[i] = this.deck[j];
      this.deck[j] = tmp;
    }
  }

  deal() {
    return this.deck.pop();
  }

  isEmpty() {
    return (this.deck.length === 0);
  }

  length() {
    return this.deck.length;
  }
}

class Card {
  constructor(card) {
    this.card = card;
    const cardValues = {
      "Ace of Hearts": 1, "2 of Hearts": 2, "3 of Hearts": 3, "4 of Hearts": 4, "5 of Hearts": 5, "6 of Hearts": 6, "7 of Hearts": 7, "8 of Hearts": 8, "9 of Hearts": 9, "10 of Hearts": 10, "Jack of Hearts": 10, "Queen of Hearts": 10, "King of Hearts": 10,
      "Ace of Diamonds": 1, "2 of Diamonds": 2, "3 of Diamonds": 3, "4 of Diamonds": 4, "5 of Diamonds": 5, "6 of Diamonds": 6, "7 of Diamonds": 7, "8 of Diamonds": 8, "9 of Diamonds": 9, "10 of Diamonds": 10, "Jack of Diamonds": 10, "Queen of Diamonds": 10, "King of Diamonds": 10,
      "Ace of Clubs": 1, "2 of Clubs": 2, "3 of Clubs": 3, "4 of Clubs": 4, "5 of Clubs": 5, "6 of Clubs": 6, "7 of Clubs": 7, "8 of Clubs": 8, "9 of Clubs": 9, "10 of Clubs": 10, "Jack of Clubs": 10, "Queen of Clubs": 10, "King of Clubs": 10,
      "Ace of Spades": 1, "2 of Spades": 2, "3 of Spades": 3, "4 of Spades": 4, "5 of Spades": 5, "6 of Spades": 6, "7 of Spades": 7, "8 of Spades": 8, "9 of Spades": 9, "10 of Spades": 10, "Jack of Spades": 10, "Queen of Spades": 10, "King of Spades": 10
    };
    
    this.value = cardValues[card];
    this.suit = card.substring(card.indexOf(" of ") + 4);
    this.placeHolder = null;
    this.flipped = false;
    
    // Manejo especial para los Ases en Blackjack
    this.isAce = card.startsWith("Ace");

    // Actualizado para considerar que la primera imagen es el dorso (posición 0)
    // Y que las cartas empiezan en la posición 1 del sprite
    const suitOrder = {
      'Hearts': 0,
      'Diamonds': 1,
      'Clubs': 2,
      'Spades': 3
    };
    
    // +1 para saltar el dorso de la carta que está en la posición 0
    this.position = 1 + (suitOrder[this.suit] * 13) + (this.value - 1);
  }

  displayCard(placeHolder, flipped = true) {
    this.placeHolder = document.getElementById(placeHolder);
    const cardInner = this.placeHolder.querySelector('.card-inner');
    const cardFront = this.placeHolder.querySelector('.card-front');
    
    // Configurar la posición de la imagen frontal
    cardFront.style.backgroundPositionX = (-120 * this.position) + 'px';
    
    this.flipped = flipped;
    
    // Aplicar el estado inicial (volteado o no)
    if (flipped) {
      cardInner.style.transform = 'rotateY(180deg)';
    } else {
      cardInner.style.transform = 'rotateY(0deg)';
    }
  }

  flip() {
    const cardInner = this.placeHolder.querySelector('.card-inner');
    
    // Cambiar el estado de la carta
    if (this.flipped) {
      cardInner.style.transform = 'rotateY(0deg)';
      this.flipped = false;
    } else {
      cardInner.style.transform = 'rotateY(180deg)';
      this.flipped = true;
    }
  }
}

// Inicialización
const deck = new Deck();
let card1, card2, card3, playerCard1, playerCard2, playerCard3;
let autoFlipInProgress = false;

// Crear elemento de audio para el sonido de premio
const premioSound = new Audio('https://res.cloudinary.com/pcsolucion/video/upload/v1742121077/premio_bsbuz9.m4a');
premioSound.preload = 'auto';

// Iniciar el juego al cargar
window.onload = function() {
  deal();
  setTimeout(() => {
    autoFlipCards();
  }, 500);
};

// Función para repartir cartas
function deal() {
  if (deck.length() < 6) {
    deck.reset();
    deck.shuffle();
  }  

  // Reiniciar el mensaje del ganador
  const winnerMessage = document.getElementById('winnerMessage');
  winnerMessage.style.visibility = 'hidden';

  // Reiniciar los marcadores
  document.getElementById('houseScore').textContent = '0';
  document.getElementById('playerScore').textContent = '0';

  // Reiniciar los premios
  resetPrizes();

  // Repartir cartas
  card1 = new Card(deck.deal());
  card2 = new Card(deck.deal());
  card3 = new Card(deck.deal());
  playerCard1 = new Card(deck.deal());
  playerCard2 = new Card(deck.deal());
  playerCard3 = new Card(deck.deal());

  // Mostrar cartas boca abajo
  card1.displayCard("card1", false);  
  card2.displayCard("card2", false);  
  card3.displayCard("card3", false);  
  playerCard1.displayCard("playerCard1", false);  
  playerCard2.displayCard("playerCard2", false);  
  playerCard3.displayCard("playerCard3", false);  
}

// Función para voltear cartas automáticamente
function autoFlipCards() {
  autoFlipInProgress = true;
  
  // Inicializar los marcadores
  document.getElementById('playerScore').textContent = '0';
  document.getElementById('houseScore').textContent = '0';
  
  // Voltear cartas de jugador, luego la casa, y finalmente determinar ganador
  setTimeout(() => {
    playerCard1.flip();
    // Actualizar puntuación después de la primera carta
    setTimeout(() => {
      document.getElementById('playerScore').textContent = calculateHandValue([playerCard1]);
      
      playerCard2.flip();
      // Actualizar puntuación después de la segunda carta
      setTimeout(() => {
        document.getElementById('playerScore').textContent = calculateHandValue([playerCard1, playerCard2]);
        
        playerCard3.flip();
        // Actualizar puntuación después de la tercera carta
        setTimeout(() => {
          document.getElementById('playerScore').textContent = calculateHandValue([playerCard1, playerCard2, playerCard3]);
          
          // Comenzar a voltear cartas de la casa
          setTimeout(() => {
            card1.flip();
            // Actualizar puntuación después de la primera carta
            setTimeout(() => {
              document.getElementById('houseScore').textContent = calculateHandValue([card1]);
              
              card2.flip();
              // Actualizar puntuación después de la segunda carta
              setTimeout(() => {
                document.getElementById('houseScore').textContent = calculateHandValue([card1, card2]);
                
                card3.flip();
                // Actualizar puntuación después de la tercera carta
                setTimeout(() => {
                  document.getElementById('houseScore').textContent = calculateHandValue([card1, card2, card3]);
                  
                  // Determinar ganador
                  setTimeout(() => {
                    determineWinner();
                    autoFlipInProgress = false;
                  }, 1000);
                }, 500);
              }, 1200);
            }, 500);
          }, 1500);
        }, 500);
      }, 1200);
    }, 500);
  }, 800);
}

// Función para determinar el ganador
function determineWinner() {
  let playerScore = calculateHandValue([playerCard1, playerCard2, playerCard3]);
  let houseScore = calculateHandValue([card1, card2, card3]);
  let winnerMessage = document.getElementById('winnerMessage');
  let winner = '';
  
  // Resetear animaciones de premios
  resetPrizes();
  
  if (playerScore > 21) {
    winner = 'casa';
  } else if (houseScore > 21) {
    winner = 'jugador';
    document.getElementById('prizeNormal').classList.add('active');
    // Reproducir sonido de premio
    playPremioSound();
  } else if (playerScore > houseScore) {
    winner = 'jugador';
    if (playerScore === 21) {
      document.getElementById('prize21').classList.add('active');
      // Reproducir sonido de premio
      playPremioSound();
    } else {
      document.getElementById('prizeNormal').classList.add('active');
      // Reproducir sonido de premio
      playPremioSound();
    }
  } else if (playerScore < houseScore) {
    winner = 'casa';
  } else {
    winner = 'empate';
  }
  
  if (winner === 'jugador') {
    winnerMessage.textContent = '¡Has ganado!';
  } else if (winner === 'casa') {
    winnerMessage.textContent = 'La casa gana';
  } else {
    winnerMessage.textContent = 'Empate';
  }
  
  winnerMessage.style.visibility = 'visible';
  
  // Ya no reiniciamos automáticamente el juego
  autoFlipInProgress = false;
}

// Función para calcular el valor de la mano
function calculateHandValue(cards) {
  let sum = 0;
  let aces = 0;
  
  // Primero sumar valores no-ases
  for (let card of cards) {
    if (card.isAce) {
      aces++;
    } else {
      sum += card.value;
    }
  }
  
  // Luego añadir ases
  for (let i = 0; i < aces; i++) {
    if (sum + 11 <= 21) {
      sum += 11;
    } else {
      sum += 1;
    }
  }
  
  return sum;
}

// Función para reiniciar el juego
function resetGame() {
  deal();
  document.getElementById('winnerMessage').style.visibility = 'hidden';
}

// Función para reiniciar los premios
function resetPrizes() {
  document.querySelectorAll('.prize-row').forEach(row => {
    row.classList.remove('active');
  });
}

// Función para reproducir el sonido de premio
function playPremioSound() {
  premioSound.currentTime = 0; // Reiniciar el sonido
  premioSound.play().catch(error => {
    console.log('Error al reproducir sonido:', error);
  });
}

// Función para manejar el botón (ya no se usará, se reinicia automáticamente)
function nextStep(btn) {
  resetGame();
  setTimeout(() => {
    autoFlipCards();
  }, 500);
}