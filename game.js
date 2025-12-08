// Nokia Snake Game - Main Game Logic

// Game canvas and context
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Score display elements
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const soundToggleBtn = document.getElementById('sound-toggle');

// Difficulty buttons
const difficultyBtns = document.querySelectorAll('.difficulty-btn');

// Phone control buttons
const navBtns = document.querySelectorAll('.nav-btn');
const phonePauseBtn = document.getElementById('phone-pause');
const phoneRestartBtn = document.getElementById('phone-restart');

// Nokia color scheme
const COLORS = {
    LCD_LIGHT: '#9BBC0F',    // LCD background green
    LCD_DARK: '#0F380F',     // Dark green for game elements
    LCD_MID: '#306230'       // Medium green for accents
};

// Game configuration
const GRID_SIZE = 20;        // Size of each grid cell in pixels
const GRID_WIDTH = 20;       // Number of cells horizontally
const GRID_HEIGHT = 15;      // Number of cells vertically

// Speed settings (milliseconds per move)
const SPEED_LEVELS = {
    slow: 200,
    normal: 150,
    fast: 100
};

let currentSpeed = SPEED_LEVELS.normal;

// Touch/Swipe configuration
const SWIPE_THRESHOLD = 30;  // Minimum swipe distance in pixels

// Calculate canvas size based on grid
const CANVAS_WIDTH = GRID_SIZE * GRID_WIDTH;    // 400px
const CANVAS_HEIGHT = GRID_SIZE * GRID_HEIGHT;  // 300px

// Initialize canvas dimensions
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Direction constants
const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

// Game state
let snake = [];
let direction = DIRECTIONS.RIGHT;
let nextDirection = DIRECTIONS.RIGHT;
let food = null;
let gameLoop = null;
let score = 0;
let highScore = 0;
let isGameOver = false;
let isPaused = false;

// Touch tracking
let touchStartX = 0;
let touchStartY = 0;

// Audio state
let audioContext = null;
let isSoundEnabled = true;

// Initialize Web Audio API
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.warn('Web Audio API not supported:', e);
        audioContext = null;
    }
}

// Play a Nokia-style beep using Web Audio API
function playBeep(frequency, duration, type = 'square') {
    if (!isSoundEnabled || !audioContext) return;
    
    try {
        // Resume audio context if suspended (required for some browsers)
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        
        // Set volume
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        // Fade out
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        console.warn('Error playing sound:', e);
    }
}

// Sound effects
function playEatSound() {
    // Short high-pitched beep for eating food
    playBeep(880, 0.1, 'square');
}

function playGameOverSound() {
    if (!isSoundEnabled || !audioContext) return;
    
    // Play a descending tone sequence for game over
    setTimeout(() => playBeep(440, 0.15, 'square'), 0);
    setTimeout(() => playBeep(349, 0.15, 'square'), 150);
    setTimeout(() => playBeep(294, 0.15, 'square'), 300);
    setTimeout(() => playBeep(220, 0.3, 'square'), 450);
}

// Toggle sound on/off
function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    
    if (soundToggleBtn) {
        soundToggleBtn.textContent = isSoundEnabled ? '🔊' : '🔇';
        soundToggleBtn.classList.toggle('muted', !isSoundEnabled);
    }
    
    // Play a test beep when enabling sound
    if (isSoundEnabled) {
        playBeep(660, 0.05, 'square');
    }
}

// Update score display
function updateScoreDisplay() {
    scoreElement.textContent = score;
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
    }
}

// Initialize snake in center-left of screen with 4 segments
function initSnake() {
    snake = [
        { x: 6, y: 7 },  // Head
        { x: 5, y: 7 },  // Body
        { x: 4, y: 7 },  // Body
        { x: 3, y: 7 }   // Tail
    ];
    direction = DIRECTIONS.RIGHT;
    nextDirection = DIRECTIONS.RIGHT;
}

// Check if a position is occupied by the snake
function isPositionOnSnake(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y);
}

// Spawn food at a random empty position
function spawnFood() {
    let x, y;
    
    // Keep generating random positions until we find an empty one
    do {
        x = Math.floor(Math.random() * GRID_WIDTH);
        y = Math.floor(Math.random() * GRID_HEIGHT);
    } while (isPositionOnSnake(x, y));
    
    food = { x, y };
}

// Check if snake head is on food
function checkFoodCollision() {
    const head = snake[0];
    return food && head.x === food.x && head.y === food.y;
}

// Check if snake hit a wall
function checkWallCollision() {
    const head = snake[0];
    return (
        head.x < 0 ||
        head.x >= GRID_WIDTH ||
        head.y < 0 ||
        head.y >= GRID_HEIGHT
    );
}

// Check if snake hit itself
function checkSelfCollision() {
    const head = snake[0];
    // Check if head collides with any body segment (skip index 0 which is the head)
    return snake.slice(1).some(segment => 
        segment.x === head.x && segment.y === head.y
    );
}

// Draw paused screen
function drawPaused() {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(155, 188, 15, 0.8)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Paused text
    ctx.fillStyle = COLORS.LCD_DARK;
    ctx.font = 'bold 24px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 15);
    
    // Resume instruction
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('Press P to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 25);
}

// Draw game over screen
function drawGameOver() {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(155, 188, 15, 0.9)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Game Over text
    ctx.fillStyle = COLORS.LCD_DARK;
    ctx.font = 'bold 24px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
    
    // Final score
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText('Score: ' + score, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
    
    // Restart instruction
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('Press SPACE to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
}

// Handle game over
function gameOver() {
    isGameOver = true;
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }
    playGameOverSound();
    drawGameOver();
    console.log('Game Over! Final score:', score);
}

// Toggle pause state
function togglePause() {
    if (isGameOver) return; // Cannot pause during game over
    
    isPaused = !isPaused;
    
    if (isPaused) {
        // Stop the game loop
        if (gameLoop) {
            clearInterval(gameLoop);
            gameLoop = null;
        }
        // Draw pause overlay
        drawPaused();
    } else {
        // Resume the game
        startGameLoop();
    }
}

// Set difficulty level
function setDifficulty(speed) {
    currentSpeed = SPEED_LEVELS[speed] || SPEED_LEVELS.normal;
    
    // Update button states
    difficultyBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.speed === speed) {
            btn.classList.add('active');
        }
    });
    
    // If game is running (not paused, not game over), restart the loop with new speed
    if (!isPaused && !isGameOver && gameLoop) {
        clearInterval(gameLoop);
        gameLoop = setInterval(gameTick, currentSpeed);
    }
}

// Change direction (used by both keyboard and touch controls)
function changeDirection(newDirection) {
    if (isPaused || isGameOver) return;
    
    if (newDirection && !isOppositeDirection(newDirection, direction)) {
        nextDirection = newDirection;
    }
}

// Restart the game
function restartGame() {
    initSnake();
    spawnFood();
    score = 0;
    isGameOver = false;
    isPaused = false;
    updateScoreDisplay();
    render();
    startGameLoop();
}

// Draw the game grid (Nokia LCD style)
function drawGrid() {
    // Fill background with LCD green
    ctx.fillStyle = COLORS.LCD_LIGHT;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw subtle grid lines for Nokia LCD effect
    ctx.strokeStyle = '#8CAD0F';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
    }
}

// Draw a single grid cell (for snake segments and food)
function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(
        x * GRID_SIZE,
        y * GRID_SIZE,
        GRID_SIZE,
        GRID_SIZE
    );
}

// Draw the snake
function drawSnake() {
    // All segments look identical (classic Nokia style)
    snake.forEach(segment => {
        drawCell(segment.x, segment.y, COLORS.LCD_DARK);
    });
}

// Draw the food
function drawFood() {
    if (food) {
        drawCell(food.x, food.y, COLORS.LCD_DARK);
    }
}

// Move the snake
function moveSnake() {
    // Apply the queued direction change
    direction = nextDirection;
    
    // Calculate new head position
    const head = snake[0];
    const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
    };
    
    // Add new head to front of snake
    snake.unshift(newHead);
    
    // Check for wall collision
    if (checkWallCollision()) {
        gameOver();
        return;
    }
    
    // Check for self collision
    if (checkSelfCollision()) {
        gameOver();
        return;
    }
    
    // Check if snake ate food
    if (checkFoodCollision()) {
        // Snake grows - don't remove tail
        score += 10;
        updateScoreDisplay();
        playEatSound();
        spawnFood();
    } else {
        // Snake maintains length - remove tail
        snake.pop();
    }
}

// Check if two directions are opposite
function isOppositeDirection(dir1, dir2) {
    return dir1.x + dir2.x === 0 && dir1.y + dir2.y === 0;
}

// Handle keyboard input
function handleKeyDown(event) {
    // Handle restart when game is over
    if (isGameOver) {
        if (event.key === ' ' || event.code === 'Space') {
            event.preventDefault();
            restartGame();
        }
        return;
    }
    
    // Handle pause toggle
    if (event.key === 'p' || event.key === 'P' || event.key === 'Escape') {
        event.preventDefault();
        togglePause();
        return;
    }
    
    // Handle mute toggle
    if (event.key === 'm' || event.key === 'M') {
        event.preventDefault();
        toggleSound();
        return;
    }
    
    // Ignore direction keys when paused
    if (isPaused) return;
    
    let newDirection = null;
    
    switch (event.key) {
        case 'ArrowUp':
            newDirection = DIRECTIONS.UP;
            break;
        case 'ArrowDown':
            newDirection = DIRECTIONS.DOWN;
            break;
        case 'ArrowLeft':
            newDirection = DIRECTIONS.LEFT;
            break;
        case 'ArrowRight':
            newDirection = DIRECTIONS.RIGHT;
            break;
        default:
            return; // Ignore other keys
    }
    
    // Prevent page scrolling
    event.preventDefault();
    
    changeDirection(newDirection);
}

// Handle touch start
function handleTouchStart(event) {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}

// Handle touch end (detect swipe)
function handleTouchEnd(event) {
    if (event.changedTouches.length === 0) return;
    
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    
    // Check if this is a tap (for restart on game over)
    if (Math.abs(deltaX) < SWIPE_THRESHOLD && Math.abs(deltaY) < SWIPE_THRESHOLD) {
        if (isGameOver) {
            restartGame();
        }
        return;
    }
    
    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > SWIPE_THRESHOLD) {
            changeDirection(DIRECTIONS.RIGHT);
        } else if (deltaX < -SWIPE_THRESHOLD) {
            changeDirection(DIRECTIONS.LEFT);
        }
    } else {
        // Vertical swipe
        if (deltaY > SWIPE_THRESHOLD) {
            changeDirection(DIRECTIONS.DOWN);
        } else if (deltaY < -SWIPE_THRESHOLD) {
            changeDirection(DIRECTIONS.UP);
        }
    }
}

// Handle touch move (prevent scrolling)
function handleTouchMove(event) {
    event.preventDefault();
}

// Main render function
function render() {
    drawGrid();
    drawFood();
    drawSnake();
}

// Game tick - called on each game loop iteration
function gameTick() {
    moveSnake();
    render();
}

// Start the game loop
function startGameLoop() {
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    gameLoop = setInterval(gameTick, currentSpeed);
}

// Set up difficulty button listeners
function setupDifficultyButtons() {
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setDifficulty(btn.dataset.speed);
        });
    });
}

// Set up phone nav button controls
function setupPhoneControls() {
    navBtns.forEach(btn => {
        const handleNavClick = (e) => {
            e.preventDefault();
            const dir = btn.dataset.direction;
            switch (dir) {
                case 'up':
                    changeDirection(DIRECTIONS.UP);
                    break;
                case 'down':
                    changeDirection(DIRECTIONS.DOWN);
                    break;
                case 'left':
                    changeDirection(DIRECTIONS.LEFT);
                    break;
                case 'right':
                    changeDirection(DIRECTIONS.RIGHT);
                    break;
            }
        };
        
        btn.addEventListener('click', handleNavClick);
        btn.addEventListener('touchstart', handleNavClick);
    });
    
    // Phone pause button
    if (phonePauseBtn) {
        const handlePause = (e) => {
            e.preventDefault();
            if (isGameOver) {
                restartGame();
            } else {
                togglePause();
            }
        };
        phonePauseBtn.addEventListener('click', handlePause);
        phonePauseBtn.addEventListener('touchstart', handlePause);
    }
    
    // Phone restart button
    if (phoneRestartBtn) {
        const handleRestart = (e) => {
            e.preventDefault();
            restartGame();
        };
        phoneRestartBtn.addEventListener('click', handleRestart);
        phoneRestartBtn.addEventListener('touchstart', handleRestart);
    }
}

// Set up touch controls (swipe gestures)
function setupTouchControls() {
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
}

// Set up sound toggle button
function setupSoundToggle() {
    if (soundToggleBtn) {
        soundToggleBtn.addEventListener('click', toggleSound);
    }
}

// Game initialization
function init() {
    // Initialize audio
    initAudio();
    
    initSnake();
    spawnFood();
    score = 0;
    isGameOver = false;
    isPaused = false;
    updateScoreDisplay();
    render();
    
    // Set up keyboard controls
    document.addEventListener('keydown', handleKeyDown);
    
    // Set up difficulty buttons
    setupDifficultyButtons();
    
    // Set up phone controls
    setupPhoneControls();
    
    // Set up touch/swipe controls
    setupTouchControls();
    
    // Set up sound toggle
    setupSoundToggle();
    
    // Start the game loop
    startGameLoop();
    
    console.log('Snake Game started! Use arrow keys or swipe to control. P to pause. M to mute.');
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
