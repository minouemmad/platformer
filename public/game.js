const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 20;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 60,
    width: 40,
    height: 40,
    speed: 5,
    dy: 0,
    gravity: 1,
    jumpStrength: 15,
    isJumping: false
};

const levels = [
    {
        backgroundColor: '#87CEEB',
        obstacles: [
            { x: 300, y: canvas.height - 60, width: 40, height: 40, direction: 1, speed: 2 },
            { x: 500, y: canvas.height - 100, width: 40, height: 40, direction: 1, speed: 2 },
            { x: 700, y: canvas.height - 150, width: 40, height: 40, direction: 1, speed: 2 },
            { x: 900, y: canvas.height - 60, width: 40, height: 40, direction: 1, speed: 2 },
            { x: 1100, y: canvas.height - 100, width: 40, height: 40, direction: 1, speed: 2 },
            { x: 1300, y: canvas.height - 200, width: 40, height: 40, direction: 1, speed: 2 },
            { x: 1500, y: canvas.height - 250, width: 40, height: 40, direction: 1, speed: 2 },
            { x: 1700, y: canvas.height - 300, width: 40, height: 40, direction: 1, speed: 2 },
        ],
        endBlock: { x: canvas.width / 2 - 20, y: 50, width: 40, height: 40 }
    },
    {
        backgroundColor: '#FFD700',
        obstacles: [
            { x: 200, y: canvas.height - 60, width: 40, height: 40, direction: 1, speed: 2 },
            { x: 400, y: canvas.height - 100, width: 40, height: 40, direction: 1, speed: 2 },
            { x: 600, y: canvas.height - 150, width: 40, height: 40, direction: 1, speed: 2 },
            { x: 800, y: canvas.height - 60, width: 40, height: 40, direction: 1, speed: 2 },
            { x: 1000, y: canvas.height - 100, width: 40, height: 40, direction: 1, speed: 2 },
            { x: 1200, y: canvas.height - 150, width: 40, height: 40, direction: 1, speed: 2 }
        ],
        endBlock: { x: canvas.width / 2 - 20, y: 50, width: 40, height: 40 }
    },
    {
        backgroundColor: '#98FB98',
        obstacles: [
            { x: 200, y: canvas.height - 80, width: 100, height: 20 },
            { x: 400, y: canvas.height - 200, width: 100, height: 20 },
            { x: 600, y: canvas.height - 320, width: 100, height: 20 },
            { x: 800, y: canvas.height - 440, width: 100, height: 20 }
        ],
        platforms: [
            { x: 50, y: canvas.height - 150, width: 100, height: 20 },
            { x: 250, y: canvas.height - 270, width: 100, height: 20 },
            { x: 450, y: canvas.height - 390, width: 100, height: 20 },
            { x: 650, y: canvas.height - 510, width: 100, height: 20 },
            { x: 850, y: canvas.height - 630, width: 100, height: 20 }
        ],
        endBlock: { x: canvas.width - 60, y: canvas.height - 650, width: 40, height: 40 }
    }
];

let currentLevel = 0;
let keys = {};
let gameOver = false;
let gameWon = false;
let startTime;
let completionTime;
let records = [];
let gameStarted = false;

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'ArrowUp' && !player.isJumping && currentLevel === 2) {
        player.dy = -player.jumpStrength;
        player.isJumping = true;
    }

    // Prevent default behavior for arrow keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

function resetGame() {
    player.x = canvas.width / 2 - 20;
    player.y = canvas.height - 60;
    player.dy = currentLevel === 2 ? 0 : 5;
    player.isJumping = false;
    gameOver = false;
    gameWon = false;
    gameStarted = false;
    document.getElementById('retryOverlay').style.display = 'none';
    document.getElementById('nextLevelOverlay').style.display = 'none';
    resizeCanvas();
    showLevelOverlay();
}

function retryGame() {
    resetGame();
}

function nextLevel() {
    currentLevel++;
    if (currentLevel >= levels.length) {
        currentLevel = 0;
    }
    resetGame();
}

function update() {
    if (gameOver || gameWon) return;

    if (!gameStarted) return;

    // Move player left and right
    if (keys['ArrowLeft']) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight']) {
        player.x += player.speed;
    }

    // Apply gravity for the platformer level
    if (currentLevel === 2) {
        player.dy += player.gravity;
    } else {
        // Move player upwards
        player.y -= player.dy;
    }

    // Prevent going below the screen
    if (player.y + player.height >= canvas.height) {
        player.y = canvas.height - player.height;
        player.dy = 0;
        player.isJumping = false;
    }

    const level = levels[currentLevel];
    const obstacles = level.obstacles;
    const endBlock = level.endBlock;

    // Move obstacles
    obstacles.forEach(obstacle => {
        obstacle.x += obstacle.direction * obstacle.speed;
        if (obstacle.x + obstacle.width > canvas.width || obstacle.x < 0) {
            obstacle.direction *= -1;
        }
    });

    // Collision detection with obstacles
    obstacles.forEach(obstacle => {
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {
            // Player dies
            gameOver = true;
            document.getElementById('retryOverlay').style.display = 'block';
        }
    });

    // Collision detection with platforms for the platformer level
    if (currentLevel === 2) {
        level.platforms.forEach(platform => {
            if (player.x < platform.x + platform.width &&
                player.x + player.width > platform.x &&
                player.y + player.height > platform.y &&
                player.y + player.height - player.dy <= platform.y) {
                player.y = platform.y - player.height;
                player.dy = 0;
                player.isJumping = false;
            }
        });
    }

    // Check for reaching the end block
    if (player.x < endBlock.x + endBlock.width &&
        player.x + player.width > endBlock.x &&
        player.y < endBlock.y + endBlock.height &&
        player.y + player.height > endBlock.y) {
        // Reached the end block
        gameWon = true;
        completionTime = (Date.now() - startTime) / 1000;
        records.push(`Level ${currentLevel + 1}: ${completionTime} seconds`);
        document.getElementById('completionTime').textContent = `Completion Time: ${completionTime} seconds`;
        document.getElementById('nextLevelOverlay').style.display = 'block';
    }

    draw();
}

function draw() {
    const level = levels[currentLevel];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = level.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw obstacles
    ctx.fillStyle = 'blue';
    level.obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw platforms for the platformer level
    if (currentLevel === 2) {
        ctx.fillStyle = 'brown';
        level.platforms.forEach(platform => {
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        });
    }

    // Draw end block
    ctx.fillStyle = 'green';
    ctx.fillRect(level.endBlock.x, level.endBlock.y, level.endBlock.width, level.endBlock.height);

    requestAnimationFrame(update);
}

function showLevelOverlay() {
    document.getElementById('levelText').textContent = `Level ${currentLevel + 1}`;
    document.getElementById('levelOverlay').style.display = 'block';
}

function startLevel() {
    document.getElementById('levelOverlay').style.display = 'none';
    setTimeout(() => {
        gameStarted = true;
        startTime = Date.now();
        update();
    }, 1000);
}

// Initialize the game
resetGame();
