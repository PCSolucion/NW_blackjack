import Game from './models/Game.js';
import GameUI from './ui/GameUI.js';

// Función para verificar que todos los elementos necesarios estén presentes
function verificarElementosDOM() {
    const elementosRequeridos = [
        'dealButton',
        'nextButton',
        'houseScore',
        'playerScore',
        'card1',
        'card2',
        'card3',
        'playerCard1',
        'playerCard2',
        'playerCard3',
        'winnerMessage',
        'prize21',
        'prizeNormal'
    ];

    const elementosFaltantes = elementosRequeridos.filter(id => !document.getElementById(id));
    
    if (elementosFaltantes.length > 0) {
        console.error('Elementos DOM faltantes:', elementosFaltantes);
        return false;
    }
    return true;
}

// Inicializar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Iniciando el juego...');
        
        if (!verificarElementosDOM()) {
            throw new Error('Faltan elementos necesarios en el DOM');
        }

        const game = new Game();
        console.log('Juego creado correctamente');

        const gameUI = new GameUI(game);
        console.log('UI del juego creada correctamente');

        // Verificar que los botones tengan los event listeners
        const dealButton = document.getElementById('dealButton');
        const nextButton = document.getElementById('nextButton');

        if (!dealButton.onclick) {
            console.error('El botón de repartir no tiene event listener');
            dealButton.addEventListener('click', () => {
                console.log('Botón de repartir clickeado');
                gameUI.handleDeal();
            });
        }

        if (!nextButton.onclick) {
            console.error('El botón siguiente no tiene event listener');
            nextButton.addEventListener('click', () => {
                console.log('Botón siguiente clickeado');
                gameUI.handleNext();
            });
        }

        // Iniciar el primer juego automáticamente
        console.log('Iniciando primer juego...');
        gameUI.handleDeal();
        
    } catch (error) {
        console.error('Error al inicializar el juego:', error);
        alert('Error al inicializar el juego. Por favor, recarga la página.');
    }
}); 