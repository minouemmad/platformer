const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Make the canvas slightly smaller than the window size
function resizeCanvas() {
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 20;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const player = {
    x: 50,
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
            { x: 300, y: canvas.height - 60, width: 40, height: 40 },
            { x: 500, y: canvas.height - 100, width: 40, height: 40 },
            { x: 700, y: canvas.height - 150, width: 40, height: 40 },
            { x: 900, y: canvas.height - 60, width: 40, height: 40 },
            { x: 1100, y: canvas.height - 100, width: 40, height: 40 }
        ],
        endBlock: { x: 1300, y: canvas.height - 60, width: 40, height: 40 }
    },
    {
        backgroundColor: '#FFD700',
        obstacles: [
            { x: 200, y: canvas.height - 60, width: 40, height: 40 },
            { x: 400, y: canvas.height - 100, width: 40, height: 40 },
            { x: 600, y: canvas.height - 150, width: 40, height: 40 },
            { x: 800, y: canvas.height - 60, width: 40, height: 40 },
            { x: 1000, y: canvas.height - 100, width: 40, height: 40 },
            { x: 1200, y: canvas.height - 150, width: 40, height: 40 }
        ],
        endBlock: { x: 1400, y: canvas.height - 60, width: 40, height: 40 }
    }
];

let currentLevel = 0;
let keys = {};
let gameOver = false;
let gameWon = false;

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'ArrowUp' && !player.isJumping) {
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
    player.x = 50;
    player.y = canvas.height - 60;
    player.dy = 0;
    player.isJumping = false;
    gameOver = false;
    gameWon = false;
    document.getElementById('retryOverlay').style.display = 'none';
    document.getElementById('nextLevelOverlay').style.display = 'none';
    resizeCanvas();
    update();
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

    // Move player left and right
    if (keys['ArrowLeft']) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight']) {
        player.x += player.speed;
    }

    // Apply gravity
    player.dy += player.gravity;
    player.y += player.dy;

    // Prevent falling through the floor
    if (player.y + player.height >= canvas.height) {
        player.y = canvas.height - player.height;
        player.dy = 0;
        player.isJumping = false;
    }

    const level = levels[currentLevel];
    const obstacles = level.obstacles;
    const endBlock = level.endBlock;

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

    // Check for reaching the end block
    if (player.x < endBlock.x + endBlock.width &&
        player.x + player.width > endBlock.x &&
        player.y < endBlock.y + endBlock.height &&
        player.y + player.height > endBlock.y) {
        // Reached the end block
        gameWon = true;
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

    // Draw end block
    ctx.fillStyle = 'green';
    ctx.fillRect(level.endBlock.x, level.endBlock.y, level.endBlock.width, level.endBlock.height);

    requestAnimationFrame(update);
}

update();
