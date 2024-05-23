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

const obstacles = [
    { x: 300, y: canvas.height - 60, width: 40, height: 40 },
    { x: 500, y: canvas.height - 100, width: 40, height: 40 },
    { x: 700, y: canvas.height - 150, width: 40, height: 40 },
    { x: 900, y: canvas.height - 60, width: 40, height: 40 },
    { x: 1100, y: canvas.height - 100, width: 40, height: 40 }
];

// End block
const endBlock = { x: 1300, y: canvas.height - 60, width: 40, height: 40 };

let keys = {};
let gameOver = false;

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
    window.location.href = '/';
}

function update() {
    if (gameOver) return;

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

    // Collision detection with obstacles
    obstacles.forEach(obstacle => {
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {
            // Player dies
            gameOver = true;
            setTimeout(resetGame, 1000);
        }
    });

    // Check for reaching the end block
    if (player.x < endBlock.x + endBlock.width &&
        player.x + player.width > endBlock.x &&
        player.y < endBlock.y + endBlock.height &&
        player.y + player.height > endBlock.y) {
        // Reached the end block
        setTimeout(resetGame, 500);
    }

    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw obstacles
    ctx.fillStyle = 'blue';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw end block
    ctx.fillStyle = 'green';
    ctx.fillRect(endBlock.x, endBlock.y, endBlock.width, endBlock.height);

    requestAnimationFrame(update);
}

update();
