class QLearningAgent {
    constructor(numStates, numActions, alpha = 0.1, gamma = 0.9, epsilon = 0.1) {
        this.numStates = numStates;
        this.numActions = numActions;
        this.alpha = alpha; // Learning rate
        this.gamma = gamma; // Discount factor
        this.epsilon = epsilon; // Exploration rate
        this.qTable = this.initializeQTable();
    }

    initializeQTable() {
        let table = [];
        for (let i = 0; i < this.numStates; i++) {
            table[i] = Array(this.numActions).fill(0);
        }
        return table;
    }

    chooseAction(state) {
        if (Math.random() < this.epsilon) {
            return Math.floor(Math.random() * this.numActions); // Explore
        } else {
            return this.qTable[state].indexOf(Math.max(...this.qTable[state])); // Exploit
        }
    }

    updateQValue(state, action, reward, nextState) {
        const bestNextAction = this.qTable[nextState].indexOf(Math.max(...this.qTable[nextState]));
        const target = reward + this.gamma * this.qTable[nextState][bestNextAction];
        this.qTable[state][action] = this.qTable[state][action] + this.alpha * (target - this.qTable[state][action]);
    }
}

class AIPlayer {
    constructor(agent, x, y, width, height, speed, color) {
        this.agent = agent;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.color = color;
        this.velX = 0;
        this.velY = 0;
        this.jumping = false;
        this.grounded = false;
    }

    update(player, boxes) {
        const state = this.getState(player);
        const action = this.agent.chooseAction(state);
        this.performAction(action);
        this.applyPhysics();
        this.handleCollisions(boxes);
        this.updateQValue(player, state, action);
    }

    getState(player) {
        const dx = Math.sign(player.x - this.x);
        const dy = Math.sign(player.y - this.y);
        return dx + 1 + (dy + 1) * 3; // Simple state based on relative position
    }

    performAction(action) {
        switch (action) {
            case 0: // Move left
                if (this.velX > -this.speed) {
                    this.velX--;
                }
                break;
            case 1: // Move right
                if (this.velX < this.speed) {
                    this.velX++;
                }
                break;
            case 2: // Jump
                if (!this.jumping && this.grounded) {
                    this.jumping = true;
                    this.grounded = false;
                    this.velY = -this.speed * 2.5; // Adjust jump height if needed
                }
                break;
        }
    }

    applyPhysics() {
        this.velX *= 0.8; // Friction
        this.velY += 0.4; // Gravity
        this.x += this.velX;
        this.y += this.velY;
    }

    handleCollisions(boxes) {
        this.grounded = false;
        for (let box of boxes) {
            let dir = colCheck(this, box);
            if (dir === "l" || dir === "r") {
                this.velX = 0;
                this.jumping = false;
            } else if (dir === "b") {
                this.grounded = true;
                this.jumping = false;
            } else if (dir === "t") {
                this.velY *= -1;
            }
        }
        if (this.grounded) {
            this.velY = 0;
        }
    }

    updateQValue(player, state, action) {
        const nextState = this.getState(player);
        const reward = -Math.sqrt((this.x - player.x) ** 2 + (this.y - player.y) ** 2); // Negative distance as reward
        this.agent.updateQValue(state, action, reward, nextState);
    }
}

export { QLearningAgent, AIPlayer };
