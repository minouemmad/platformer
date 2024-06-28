// ai.js
var aiPlayer = {
    x: width / 4,
    y: height - 35,
    width: 25,
    height: 25,
    speed: 1.5,
    color: 'red'
};

function updateAI() {
    // Move AI towards the player
    if (aiPlayer.x < player.x) {
        aiPlayer.x += aiPlayer.speed;
    } else {
        aiPlayer.x -= aiPlayer.speed;
    }

    if (aiPlayer.y < player.y) {
        aiPlayer.y += aiPlayer.speed;
    } else {
        aiPlayer.y -= aiPlayer.speed;
    }

    // AI collision detection with player
    if (colCheck(aiPlayer, player) !== null && !player.invincible) {
        showMenu("Game Over");
    }
}

function update() {
    // Handle player input and movements
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
    for (var j = 0; j < movingPlatforms.length; j++) {
        ctx.fillStyle = movingPlatforms[j].color;
        ctx.fillRect(movingPlatforms[j].x, movingPlatforms[j].y, movingPlatforms[j].width, movingPlatforms[j].height);

        // Update position of moving platform
        if (movingPlatforms[j].moveX) {
            movingPlatforms[j].x += movingPlatforms[j].speed * movingPlatforms[j].dir;
            if (movingPlatforms[j].x > movingPlatforms[j].range || movingPlatforms[j].x < -movingPlatforms[j].range) {
                movingPlatforms[j].dir *= -1;
            }
        }
        if (movingPlatforms[j].moveY) {
            movingPlatforms[j].y += movingPlatforms[j].speed * movingPlatforms[j].dir;
            if (movingPlatforms[j].y > movingPlatforms[j].range || movingPlatforms[j].y < -movingPlatforms[j].range) {
                movingPlatforms[j].dir *= -1;
            }
        }

        var dir = colCheck(player, movingPlatforms[j]);
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

    if (player.grounded) {
        player.velY = 0;
    }

    player.x += player.velX;
    player.y += player.velY;

    ctx.fill(); // Draw player character
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw AI player
    ctx.fillStyle = aiPlayer.color;
    ctx.fillRect(aiPlayer.x, aiPlayer.y, aiPlayer.width, aiPlayer.height);

    // Update AI
    updateAI();

    // Draw power-ups
    for (var k = 0; k < powerups.length; k++) {
        ctx.save();
        var cx = powerups[k].x + 0.5 * powerups[k].width,
            cy = powerups[k].y + 0.5 * powerups[k].height;
        ctx.translate(cx, cy);
        ctx.rotate((Math.PI / 180) * 45);
        if (powerups[k].effect === 'tele') {
            ctx.rotate((Math.PI / 180) * powerups[k].rotate);
            powerups[k].rotate = (Math.PI / 180) * powerups[k].rotate;
        }
        ctx.translate(-cx, -cy);
        ctx.fillStyle = powerups[k].color;
        ctx.fillRect(powerups[k].x, powerups[k].y, powerups[k].width, powerups[k].height);
        ctx.restore();

        // Power-up collision
        if (colCheck(player, powerups[k]) !== null) {
            if (powerups[k].effect === 'gravity') {
                gravity = 0.2; // decrease gravity
                player.speed = 4;
                player.color = 'white';
            } else if (powerups[k].effect === 'shrink') {
                player.width = 10;
                player.height = 10;
                player.speed = 5;
            } else if (powerups[k].effect === 'tele') {
                player.x = powerups[k].px;
                player.y = powerups[k].py;
            } else if (powerups[k].effect === 'win') {
                showMenu("You Win! Play Again?");
            } else if (powerups[k].effect === 'speed') {
                player.speed = 6;
                player.color = 'blue';
            } else if (powerups[k].effect === 'invincibility') {
                player.invincible = true;
                player.color = 'gold';
                setTimeout(function () {
                    player.invincible = false;
                    player.color = '#E6AC27';
                }, 5000); // Invincibility lasts for 5 seconds
            }
            if (!powerups[k].stay) powerups[k].width = 0; // Make power-up disappear
        }
    }

    // Draw obstacles
    for (var l = 0; l < obstacles.length; l++) {
        ctx.fillStyle = obstacles[l].color;
        ctx.fillRect(obstacles[l].x, obstacles[l].y, obstacles[l].width, obstacles[l].height);
        if (colCheck(player, obstacles[l]) !== null && !player.invincible) {
            showMenu("Game Over");
            return;
        }
    }

    requestAnimationFrame(update);
}

// Call initializeGame() and update() in your main script file to start the game
initializeGame();
update();
