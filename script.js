class Deck {
  constructor() {
  this.deck = [];
  this.reset(); //Add 52 cards to the deck
  this.shuffle(); //Suffle the deck
} //End of constructor


reset() {
  this.deck = [];
  const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
  const values = ['Ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'Jack', 'Queen', 'King'];

  for (let suit in suits) {
    for (let value in values) {
      this.deck.push(values[value] + " of " + suits[suit]);
    }
  }
} //End of reset()


shuffle() {
  let numberOfCards = this.deck.length;  
  for (var i=0; i<numberOfCards; i++) {
    let j = Math.floor(Math.random() * numberOfCards);
    let tmp = this.deck[i];
    this.deck[i] = this.deck[j];
    this.deck[j] = tmp;
  }
} //End of shuffle()

deal(){
  return this.deck.pop();
} //End of deal()

isEmpty() {
  return (this.deck.length==0);
} //End of isEmpty()

length() {
  return this.deck.length;
} //End of length()

} //End of Deck Class

class Card {
constructor(card) {
    this.card = card;
    const cardValues = {"Ace of Hearts":1, "2 of Hearts":2, "3 of Hearts":3, "4 of Hearts":4, "5 of Hearts":5, "6 of Hearts":6, "7 of Hearts":7, "8 of Hearts":8, "9 of Hearts":9, "10 of Hearts":10, "Jack of Hearts":10, "Queen of Hearts":10, "King of Hearts":10,
                     "Ace of Diamonds":1, "2 of Diamonds":2, "3 of Diamonds":3, "4 of Diamonds":4, "5 of Diamonds":5, "6 of Diamonds":6, "7 of Diamonds":7, "8 of Diamonds":8, "9 of Diamonds":9, "10 of Diamonds":10, "Jack of Diamonds":10, "Queen of Diamonds":10, "King of Diamonds":10,
                     "Ace of Clubs":1, "2 of Clubs":2, "3 of Clubs":3, "4 of Clubs":4, "5 of Clubs":5, "6 of Clubs":6, "7 of Clubs":7, "8 of Clubs":8, "9 of Clubs":9, "10 of Clubs":10, "Jack of Clubs":10, "Queen of Clubs":10, "King of Clubs":10,
                     "Ace of Spades":1, "2 of Spades":2, "3 of Spades":3, "4 of Spades":4, "5 of Spades":5, "6 of Spades":6, "7 of Spades":7, "8 of Spades":8, "9 of Spades":9, "10 of Spades":10, "Jack of Spades":10, "Queen of Spades":10, "King of Spades":10};
  
  this.value = cardValues[card];
  this.suit = card.substring(card.indexOf(" of ")+4);
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
} //End of Constructor

displayCard(placeHolder,flipped=true) {
  this.placeHolder = document.getElementById(placeHolder);
  this.placeHolder.classList.add("card");
  this.flipped=flipped;
  if (flipped) {
    this.placeHolder.style.backgroundPosition = -150*this.position + "px";
  } else {
    this.placeHolder.style.backgroundPosition = "0px";  
  }
} // End of displayCard

flip() {
  if (this.flipped) {
    this.addFlipAnimation();
    setTimeout(() => {
    this.placeHolder.style.backgroundPosition = "0px";
      this.flipped = false;
    }, 300); // La mitad de la duración de la animación para cambiar la imagen cuando la carta está de lado
  } else {
    this.addFlipAnimation();
    setTimeout(() => {
    this.placeHolder.style.backgroundPosition = -150*this.position + "px";
      this.flipped = true;
    }, 300); // La mitad de la duración de la animación para cambiar la imagen cuando la carta está de lado
  }
} //End of flip()

addFlipAnimation() {
  // Añadir la clase de animación
  this.placeHolder.classList.add('flipping');
  
  // Eliminar la clase después de que la animación haya terminado
  setTimeout(() => {
    this.placeHolder.classList.remove('flipping');
  }, 600); // Duración completa de la animación
}

} //End of Card class

const deck = new Deck();
let card1, card2, card3, playerCard1, playerCard2, playerCard3;
let autoFlipInProgress = false; // Variable para controlar si el volteo automático está en progreso
let houseTotalPoints = 0;
let playerTotalPoints = 0;

// Crear elemento de audio para el sonido de premio
let premioSound = new Audio('https://res.cloudinary.com/pcsolucion/video/upload/v1742121077/premio_bsbuz9.m4a');
premioSound.preload = 'auto';

// Función para activar la animación de premio
function activatePrize(prizeType) {
// Primero, resetear todos los premios
document.querySelectorAll('.prize-row').forEach(row => {
  row.classList.remove('active');
});

// Activar el premio correspondiente
if (prizeType === '21') {
  document.getElementById('prize21').classList.add('active');
} else if (prizeType === 'normal') {
  document.getElementById('prizeNormal').classList.add('active');
}

// Reproducir sonido de premio al final de la ronda
premioSound.currentTime = 0;
premioSound.play().catch(e => console.log("Error al reproducir sonido:", e));
}

// Función para resetear los premios
function resetPrizes() {
document.querySelectorAll('.prize-row').forEach(row => {
  row.classList.remove('active');
});
}

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

// Repartir cartas para la casa
card1 = new Card(deck.deal());
card2 = new Card(deck.deal());
card3 = new Card(deck.deal());

// Repartir cartas para el jugador
playerCard1 = new Card(deck.deal());
playerCard2 = new Card(deck.deal());
playerCard3 = new Card(deck.deal());

// Reiniciar los puntajes
houseTotalPoints = 0;
playerTotalPoints = 0;

// Mostrar las cartas boca abajo inicialmente
card1.displayCard("card1", false);  
card2.displayCard("card2", false);  
card3.displayCard("card3", false);  
playerCard1.displayCard("playerCard1", false);  
playerCard2.displayCard("playerCard2", false);  
playerCard3.displayCard("playerCard3", false);  
} //End of deal()

function nextStep(el) {
// Si el volteo automático está en progreso, lo cancelamos y empezamos una nueva ronda
if (autoFlipInProgress) {
  autoFlipInProgress = false;
  deal();
  el.innerHTML = "Nueva ronda";
  // Iniciar volteo automático después de un breve retraso
  setTimeout(() => {
    autoFlipCards();
  }, 1000);
} else {
  // Si no hay volteo automático, el botón inicia una nueva ronda
  deal();
  el.innerHTML = "Nueva ronda";
  // Iniciar volteo automático después de un breve retraso
  setTimeout(() => {
    autoFlipCards();
  }, 1000);
}
} //End of nextStep()

// Función para calcular el valor de la mano en blackjack
function calculateHandValue(cards) {
let sum = 0;
let aces = 0;

// Sumar todos los valores
cards.forEach(card => {
  if (card.isAce) {
    aces += 1;
    // Inicialmente consideramos el as como 1
    sum += 1;
  } else {
    sum += card.value;
  }
});

// Si tenemos ases y podemos usar uno como 11 sin pasarnos de 21, lo hacemos
if (aces > 0 && sum + 10 <= 21) {
  sum += 10;
}

return sum;
}

// Función para actualizar el marcador en pantalla
function updateScoreDisplay(type, score) {
const scoreElement = document.getElementById(type + 'Score');
scoreElement.textContent = score;

// Añadir efectos visuales para los scores altos o peligrosos
if (score > 17) {
  scoreElement.style.color = '#ff9900'; // Naranja para puntuaciones altas
}
if (score > 20) {
  scoreElement.style.color = '#00ff00'; // Verde para 21
}
if (score > 21) {
  scoreElement.style.color = '#ff0000'; // Rojo si se pasa
}
}

// Función para voltear alternadamente las cartas de la casa y el jugador
function autoFlipCards() {
autoFlipInProgress = true;
const winnerMessage = document.getElementById('winnerMessage');

// Primera ronda: Carta 1 de la casa y del jugador
setTimeout(() => {
  if (!autoFlipInProgress) return;
  card1.flip();
  houseTotalPoints = calculateHandValue([card1]);
  updateScoreDisplay('house', houseTotalPoints);
  
  setTimeout(() => {
    if (!autoFlipInProgress) return;
    playerCard1.flip();
    playerTotalPoints = calculateHandValue([playerCard1]);
    updateScoreDisplay('player', playerTotalPoints);
    
    // Segunda ronda: Carta 2 de la casa y del jugador
    setTimeout(() => {
      if (!autoFlipInProgress) return;
      card2.flip();
      houseTotalPoints = calculateHandValue([card1, card2]);
      updateScoreDisplay('house', houseTotalPoints);
      
      setTimeout(() => {
        if (!autoFlipInProgress) return;
        playerCard2.flip();
        playerTotalPoints = calculateHandValue([playerCard1, playerCard2]);
        updateScoreDisplay('player', playerTotalPoints);
        
        // Tercera ronda: Carta 3 de la casa y del jugador
        setTimeout(() => {
          if (!autoFlipInProgress) return;
          card3.flip();
          houseTotalPoints = calculateHandValue([card1, card2, card3]);
          updateScoreDisplay('house', houseTotalPoints);
          
          setTimeout(() => {
            if (!autoFlipInProgress) return;
            playerCard3.flip();
            playerTotalPoints = calculateHandValue([playerCard1, playerCard2, playerCard3]);
            updateScoreDisplay('player', playerTotalPoints);
            
            // Determinar el ganador después de mostrar todas las cartas
            setTimeout(() => {
              if (!autoFlipInProgress) return;
              determineWinner();
            }, 1000);
            
          }, 2000);
        }, 2000);
      }, 2000);
    }, 2000);
  }, 2000);
}, 1000);
}

// Función para determinar el ganador
function determineWinner() {
const winnerMessage = document.getElementById('winnerMessage');
winnerMessage.style.visibility = 'visible';

// Si ambos se pasan de 21, es un empate
if (houseTotalPoints > 21 && playerTotalPoints > 21) {
  winnerMessage.textContent = "¡Empate! Ambos se pasaron de 21.";
  winnerMessage.style.color = "#ffffff";
  setTimeout(() => {
    if (autoFlipInProgress) {
      // Iniciar nueva ronda automáticamente
      nextStep(document.querySelector('#playerCards button'));
    }
  }, 3000);
  return;
}

// Si la casa se pasa de 21, gana el jugador
if (houseTotalPoints > 21) {
  winnerMessage.textContent = "¡Ganaste! La casa se pasó de 21.";
  winnerMessage.style.color = "#00ff00";
  if (playerTotalPoints === 21) {
    activatePrize('21');
  } else {
    activatePrize('normal');
  }
  return;
}

// Si el jugador se pasa de 21, gana la casa
if (playerTotalPoints > 21) {
  winnerMessage.textContent = "¡Perdiste! Te pasaste de 21.";
  winnerMessage.style.color = "#ff0000";
  return;
}

// Comparar puntuaciones si ninguno se pasó de 21
if (playerTotalPoints > houseTotalPoints) {
  winnerMessage.textContent = `¡Ganaste! ${playerTotalPoints} vs ${houseTotalPoints}`;
  winnerMessage.style.color = "#00ff00";
  if (playerTotalPoints === 21) {
    activatePrize('21');
  } else {
    activatePrize('normal');
  }
} else if (houseTotalPoints > playerTotalPoints) {
  winnerMessage.textContent = `¡Perdiste! ${playerTotalPoints} vs ${houseTotalPoints}`;
  winnerMessage.style.color = "#ff0000";
} else {
  // En caso de empate, iniciar una nueva ronda automáticamente
  winnerMessage.textContent = "¡Empate! Jugando de nuevo...";
  winnerMessage.style.color = "#ffffff";
  setTimeout(() => {
    if (autoFlipInProgress) {
      // Iniciar nueva ronda automáticamente
      nextStep(document.querySelector('#playerCards button'));
    }
  }, 3000);
}
}

// Iniciar el juego cuando la página se carga
document.addEventListener('DOMContentLoaded', function() {
deal();
// Iniciar el volteo automático después de un breve retraso
setTimeout(() => {
  autoFlipCards();
}, 1000);
});