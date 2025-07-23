const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const startGameBtn = document.getElementById('startGame');
const pauseGameBtn = document.getElementById('pauseGame');
const restartGameBtn = document.getElementById('restartGame');
const gameMessages = document.getElementById('gameMessages');

const gridSize = 20;
let snake = [];
let food = {};
let direction = 'right';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameInterval;
let gameSpeed = 150; // Milliseconds
let isPaused = true;
let gameOver = false;

highScoreDisplay.textContent = highScore;

function initializeGame() {
    snake = [{ x: 10, y: 10 }];
    direction = 'right';
    score = 0;
    scoreDisplay.textContent = score;
    generateFood();
    isPaused = true;
    gameOver = false;
    gameSpeed = 150;
    gameMessages.textContent = 'Press Start to Play!';
    draw();
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)),
        y: Math.floor(Math.random() * (canvas.height / gridSize))
    };
    // Ensure food does not spawn on the snake
    while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        food = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)),
            y: Math.floor(Math.random() * (canvas.height / gridSize))
        };
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i === 0) ? '#4CAF50' : '#8BC34A'; // Head green, body lighter green
        ctx.strokeStyle = '#2E7D32';
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
        ctx.strokeRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
    }

    // Draw food
    ctx.fillStyle = '#FF5722'; // Orange-red food
    ctx.strokeStyle = '#D84315';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2 * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}

function update() {
    if (isPaused || gameOver) return;

    const head = { x: snake[0].x, y: snake[0].y };

    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }

    // Check for collisions (wall or self)
    if (checkCollision(head)) {
        endGame();
        return;
    }

    snake.unshift(head);

    // Check if food eaten
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreDisplay.textContent = score;
        generateFood();
        // Increase speed every 5 points
        if (score % 5 === 0 && gameSpeed > 50) {
            gameSpeed -= 10;
            clearInterval(gameInterval);
            gameInterval = setInterval(update, gameSpeed);
        }
    } else {
        snake.pop(); // Remove tail segment if no food eaten
    }

    draw();
}

function checkCollision(head) {
    // Wall collision
    if (head.x < 0 || head.x >= canvas.width / gridSize ||
        head.y < 0 || head.y >= canvas.height / gridSize) {
        return true;
    }

    // Self-collision (start checking from the 4th segment to avoid immediate self-collision)
    for (let i = 4; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function startGame() {
    if (gameOver) {
        initializeGame();
    }
    if (isPaused) {
        isPaused = false;
        gameMessages.textContent = 'Game On!';
        clearInterval(gameInterval); // Clear any existing interval
        gameInterval = setInterval(update, gameSpeed);
    }
}

function pauseGame() {
    if (!gameOver) {
        isPaused = !isPaused;
        if (isPaused) {
            clearInterval(gameInterval);
            gameMessages.textContent = 'Game Paused!';
        } else {
            gameMessages.textContent = 'Game On!';
            gameInterval = setInterval(update, gameSpeed);
        }
    }
}

function endGame() {
    gameOver = true;
    isPaused = true;
    clearInterval(gameInterval);
    gameMessages.textContent = `Game Over! Your score: ${score}`;
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreDisplay.textContent = highScore;
        gameMessages.textContent += ' New High Score!';
    }
}

function restartGame() {
    clearInterval(gameInterval);
    initializeGame();
    startGame();
}

// Event Listeners
document.addEventListener('keydown', e => {
    if (gameOver && e.key !== 'Enter') return; // Only allow Enter to restart if game over

    switch (e.key) {
        case 'ArrowUp':
            if (direction !== 'down') direction = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') direction = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') direction = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') direction = 'right';
            break;
        case 'Escape': // Pause/Unpause with Escape key
            pauseGame();
            break;
        case 'Enter': // Start/Restart with Enter key
            startGame();
            break;
    }
});

startGameBtn.addEventListener('click', startGame);
pauseGameBtn.addEventListener('click', pauseGame);
restartGameBtn.addEventListener('click', restartGame);

// Initialize the game on load
initializeGame();
