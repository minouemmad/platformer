(function () {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    width = window.innerWidth,
    height = window.innerHeight,
    player = {
        x: width / 2,
        y: height - 35,
        width: 25,
        height: 25,
        speed: 3,
        velX: 0,
        velY: 0,
        jumping: false,
        grounded: false,
        color: '#E6AC27',
        invincible: false
    },
    aiPlayer = {
        x: width - 50, // Starting on the far right
        y: height - 35,
        width: 25,
        height: 25,
        speed: 2.5, // Slightly slower than the main player
        color: '#FF5733'
    },
    keys = [],
    friction = 0.8,
    gravity = 0.4,
    boxes = [],
    powerups = [],
    obstacles = [],
    movingPlatforms = [],
    menu = document.getElementById("menu"),
    menuTitle = document.getElementById("menu-title"),
    restartButton = document.getElementById("restart-button");

function initializeGame() {
    canvas.width = width;
    canvas.height = height;

    // Reset player properties
    player.x = width / 2;
    player.y = height - 35;
    player.width = 25;
    player.height = 25;
    player.velX = 0;
    player.velY = 0;
    player.grounded = false;
    player.jumping = false;
    player.invincible = false;
    player.color = '#E6AC27';
    gravity = 0.4;
    friction = 0.8;

    // Initialize AI player properties
    aiPlayer.x = width - 50;
    aiPlayer.y = height - 35;

    // Static platforms
    boxes = [
        { x: 0, y: height / 4 + 10, width: 10, height: height, color: 'green' },
        { x: 0, y: 0, width: 10, height: height / 4 - 15, color: 'green' },
        { x: 0, y: height - 10, width: width, height: 50, color: 'orange' },
        { x: width - 10, y: 0, width: 50, height: height, color: 'yellow' },
        { x: 290, y: height / 2, width: 260, height: 10, color: 'blue' },
        { x: width - 410, y: height / 2, width: 80, height: 10, color: 'blue' },
        { x: 120, y: height / 2 + 50, width: 150, height: 10, color: 'red' },
        { x: width / 2 - 60, y: height / 2 + 150, width: 90, height: 10, color: '#655643' },
        { x: width - 260, y: height / 2 + 100, width: 160, height: 10, color: '#655643' },
        { x: 0, y: height / 2 + 150, width: 90, height: 10, color: '#655643' },
        { x: 90, y: height / 2 + 150, width: 10, height: 50, color: '#655643' },
        { x: width / 4, y: height / 3, width: 100, height: 10, color: 'purple' },
        { x: width / 2, y: height / 4, width: 150, height: 10, color: 'brown' },
        // Additional platforms at the bottom
        { x: 100, y: height - 60, width: 100, height: 10, color: 'blue' },
        { x: 300, y: height - 100, width: 100, height: 10, color: 'blue' },
        { x: 500, y: height - 140, width: 100, height: 10, color: 'blue' },
        { x: 700, y: height - 180, width: 100, height: 10, color: 'blue' }
    ];

    // Moving platforms
    movingPlatforms = [
        {
            x: width / 2 - 50, y: height / 2 + 50, width: 100, height: 10, color: 'pink',
            moveX: true, moveY: false, speed: 2, range: 100, dir: 1
        },
        {
            x: width / 3, y: height / 2 + 100, width: 100, height: 10, color: 'cyan',
            moveX: false, moveY: true, speed: 2, range: 100, dir: 1
        }
    ];

    // Power-ups
    powerups = [
        { x: width - 190, y: height - 150, width: 20, height: 20, color: '#BF4D28', effect: 'shrink' },
        { x: 400, y: 150, width: 20, height: 20, color: '#BF4D28', effect: 'gravity' },
        { x: -15, y: 88, width: 20, height: 20, color: '#222', effect: 'tele', rotate: 20, px: 20, py: height - 30, stay: true },
        { x: width - 60, y: 35, width: 20, height: 20, color: '#2A5D77', effect: 'win', stay: true },
        { x: width / 2 - 100, y: height / 2 - 50, width: 20, height: 20, color: 'green', effect: 'speed' },
        { x: width / 2 + 100, y: height / 2 - 50, width: 20, height: 20, color: 'gold', effect: 'invincibility' }
    ];

    // Obstacles at the bottom
    obstacles = [
        { x: width / 3 - 20, y: height - 120, width: 40, height: 10, color: 'red', type: 'spike' },
        { x: width / 2 - 30, y: height - 100, width: 60, height: 10, color: 'red', type: 'spike' },
        { x: width / 2 + 150, y: height - 80, width: 40, height: 10, color: 'red', type: 'spike' },
        { x: width / 3 * 2, y: height - 60, width: 60, height: 10, color: 'red', type: 'spike' }
    ];
}

function update() {
    // Handle player input
    if (keys[38] || keys[32] || keys[87]) { // up arrow, space, or W
        if (!player.jumping && player.grounded) {
            player.jumping = true;
            player.grounded = false;
            player.velY = -player.speed * 3.5; // how high to jump
        }
    }
    if (keys[39] || keys[68]) { // right arrow or D
        if (player.velX < player.speed) {
            player.velX++;
        }
    }
    if (keys[37] || keys[65]) { // left arrow or A
        if (player.velX > -player.speed) {
            player.velX--;
        }
    }

    player.velX *= friction;
    player.velY += gravity;

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();

    player.grounded = false;
    
    // Draw static platforms
    for (var i = 0; i < boxes.length; i++) {
        ctx.fillStyle = boxes[i].color;
        ctx.fillRect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);

        var dir = colCheck(player, boxes[i]);
        if (dir === "l" || dir === "r") {
            player.velX = 0;
            player.jumping = false;
        } else if (dir === "b") {
            player.grounded = true;
            player.jumping = false;
        } else if (dir === "t") {
            player.velY *= -1;
        }
    }

    // Draw and update moving platforms
    for (var i = 0; i < movingPlatforms.length; i++) {
        var platform = movingPlatforms[i];
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

        if (platform.moveX) {
            platform.x += platform.speed * platform.dir;
            if (platform.x > platform.range || platform.x < 0) {
                platform.dir *= -1;
            }
        }
        if (platform.moveY) {
            platform.y += platform.speed * platform.dir;
            if (platform.y > platform.range || platform.y < 0) {
                platform.dir *= -1;
            }
        }

        var dir = colCheck(player, platform);
        if (dir === "l" || dir === "r") {
            player.velX = 0;
            player.jumping = false;
        } else if (dir === "b") {
            player.grounded = true;
            player.jumping = false;
            player.y = platform.y - player.height; // Align player on top of platform
        } else if (dir === "t") {
            player.velY *= -1;
        }
    }

    if (player.grounded) {
        player.velY = 0;
    }

    player.x += player.velX;
    player.y += player.velY;

    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Update AI player position to follow the main player
    if (aiPlayer.x < player.x) {
        aiPlayer.x += aiPlayer.speed;
    } else if (aiPlayer.x > player.x) {
        aiPlayer.x -= aiPlayer.speed;
    }

    if (aiPlayer.y < player.y) {
        aiPlayer.y += aiPlayer.speed;
    } else if (aiPlayer.y > player.y) {
        aiPlayer.y -= aiPlayer.speed;
    }

    ctx.fillStyle = aiPlayer.color;
    ctx.fillRect(aiPlayer.x, aiPlayer.y, aiPlayer.width, aiPlayer.height);

    requestAnimationFrame(update);
}

function colCheck(shapeA, shapeB) {
    var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
        vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
        hWidths = (shapeA.width / 2) + (shapeB.width / 2),
        hHeights = (shapeA.height / 2) + (shapeB.height / 2),
        colDir = null;

    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
        var oX = hWidths - Math.abs(vX),
            oY = hHeights - Math.abs(vY);
        if (oX >= oY) {
            if (vY > 0) {
                colDir = "t";
                shapeA.y += oY;
            } else {
                colDir = "b";
                shapeA.y -= oY;
            }
        } else {
            if (vX > 0) {
                colDir = "l";
                shapeA.x += oX;
            } else {
                colDir = "r";
                shapeA.x -= oX;
            }
        }
    }
    return colDir;
}

document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});

document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});

window.addEventListener("resize", function () {
    width = window.innerWidth;
    height = window.innerHeight;
    initializeGame();
});

initializeGame();
update();
