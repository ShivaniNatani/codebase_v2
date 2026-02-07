// ==========================================
// CLEAN GAME ARCHITECTURE v2
// Simple state machine: STORY → PLAYING → END
// ==========================================

// Game state - ONLY ONE AT A TIME
let gameState = 'TITLE'; // TITLE, STORY, PLAYING, VICTORY, GAMEOVER

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1280;
canvas.height = 720;

// Current chapter data
let currentChapter = 0;
let playerHealth = 5;
let playerScore = 0;
let collectiblesGathered = 0;

// Story display
let storyLines = [];
let currentStoryLine = 0;
let storyTimer = 0;

// ==========================================
// CHAPTER DATA
// ==========================================
const CHAPTERS = {
    1: {
        title: "CHAPTER 1",
        subtitle: "The College Days",
        story: [
            "Once upon a time, in a small town in Bijnor...",
            "There was a boy who wasn't the best at studies.",
            "But he had something special - a passion for technology.",
            "College was fun. Biryanis. Friends. Driving trucks.",
            "He was the macho guy everyone looked up to.",
            "Little did he know, his journey was just beginning..."
        ],
        objective: "Drive through the doubters, collect computer parts, reach Bangalore",
        collectiblesNeeded: 10
    }
};

// ==========================================
// RACING GAME (Chapter 1)
// ==========================================
const racingGame = {
    car: {
        x: 640,
        y: 600,
        width: 40,
        height: 60,
        lane: 1, // 0=left, 1=middle, 2=right
        speed: 8
    },

    lanes: [373, 640, 907], // X positions for 3 lanes

    obstacles: [],
    collectibles: [],

    roadOffset: 0,
    spawnTimer: 0,
    invincibilityTimer: 5000, // 5 seconds
    hitCooldown: 0,

    init() {
        this.car.lane = 1;
        this.car.x = this.lanes[1];
        this.car.y = 600;

        this.obstacles = [];
        this.collectibles = [];
        this.roadOffset = 0;
        this.spawnTimer = 3000; // 3 second delay before first obstacle
        this.collectibleTimer = 1500; // 1.5 second delay before first collectible
        this.invincibilityTimer = 5000;
        this.hitCooldown = 0;
        this.lastObstacleLane = -1; // Track obstacle lane

        playerScore = 0;
        collectiblesGathered = 0;

        console.log('🚗 Racing game initialized');
    },

    update(dt) {
        // Update timers
        if (this.invincibilityTimer > 0) this.invincibilityTimer -= dt;
        if (this.hitCooldown > 0) this.hitCooldown -= dt;
        this.spawnTimer -= dt;
        this.collectibleTimer -= dt; // Add collectible timer decrement

        // Handle input
        if (keys['ArrowLeft'] && this.car.lane > 0) {
            this.car.lane--;
            keys['ArrowLeft'] = false; // Prevent holding
        }
        if (keys['ArrowRight'] && this.car.lane < 2) {
            this.car.lane++;
            keys['ArrowRight'] = false;
        }

        // Move car to lane smoothly
        const targetX = this.lanes[this.car.lane];
        this.car.x += (targetX - this.car.x) * 0.2;

        // Animate road
        this.roadOffset += this.car.speed;
        if (this.roadOffset > 50) this.roadOffset = 0;

        // Spawn obstacles on separate timer
        if (this.spawnTimer <= 0) {
            this.spawnObstacle();
            this.spawnTimer = 2500; // 2.5 seconds between obstacles
        }

        // Spawn collectibles on separate timer (offset from obstacles)
        if (this.collectibleTimer <= 0) {
            this.spawnCollectible();
            this.collectibleTimer = 1800; // 1.8 seconds - offset timing
        }

        // Update obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            this.obstacles[i].y += this.car.speed;

            // Remove if off screen
            if (this.obstacles[i].y > 720) {
                this.obstacles.splice(i, 1);
                continue;
            }

            // Check collision (only if not invincible and cooldown expired)
            if (this.invincibilityTimer <= 0 && this.hitCooldown <= 0) {
                if (this.checkCollision(this.car, this.obstacles[i])) {
                    this.hit();
                    this.obstacles.splice(i, 1);
                }
            }
        }

        // Update collectibles
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            this.collectibles[i].y += this.car.speed;

            if (this.collectibles[i].y > 720) {
                this.collectibles.splice(i, 1);
                continue;
            }

            if (!this.collectibles[i].collected &&
                this.checkCollision(this.car, this.collectibles[i])) {
                this.collect();
                this.collectibles.splice(i, 1);
            }
        }

        // Check victory
        if (collectiblesGathered >= CHAPTERS[currentChapter].collectiblesNeeded) {
            gameState = 'VICTORY';
        }
    },

    spawnObstacle() {
        const lane = Math.floor(Math.random() * 3);
        this.lastObstacleLane = lane; // Track which lane has obstacle
        this.obstacles.push({
            x: this.lanes[lane],
            y: -100,
            width: 80,
            height: 80,
            lane: lane,
            label: ['DOUBT', 'FEAR', 'CAN\'T', 'WON\'T'][Math.floor(Math.random() * 4)]
        });
    },

    spawnCollectible() {
        // Spawn in a DIFFERENT lane than the last obstacle
        let lane;
        do {
            lane = Math.floor(Math.random() * 3);
        } while (lane === this.lastObstacleLane);

        this.collectibles.push({
            x: this.lanes[lane],
            y: -100,
            width: 40,
            height: 40,
            lane: lane,
            collected: false
        });
    },

    checkCollision(a, b) {
        return a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
    },

    hit() {
        playerHealth--;
        this.hitCooldown = 1000; // 1 second cooldown
        updateHUD();

        if (playerHealth <= 0) {
            gameState = 'GAMEOVER';
        }
    },

    collect() {
        collectiblesGathered++;
        playerScore += 100;
        updateHUD();
    },

    draw() {
        // Road background
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, 1280, 720);

        // Lane lines
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 4;
        ctx.setLineDash([20, 20]);

        for (let i = 0; i < 800; i += 50) {
            // Left lane line
            ctx.beginPath();
            ctx.moveTo(520, i - this.roadOffset);
            ctx.lineTo(520, i - this.roadOffset + 30);
            ctx.stroke();

            // Right lane line
            ctx.beginPath();
            ctx.moveTo(760, i - this.roadOffset);
            ctx.lineTo(760, i - this.roadOffset + 30);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // Road edges
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, 200, 720);
        ctx.fillRect(1080, 0, 200, 720);

        // Draw obstacles
        this.obstacles.forEach(obs => {
            ctx.fillStyle = '#ff4757';
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(obs.label, obs.x + 40, obs.y + 45);
        });

        // Draw collectibles
        this.collectibles.forEach(col => {
            ctx.font = '32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('💻', col.x + 20, col.y + 30);
        });

        // Draw car
        if (this.invincibilityTimer > 0) {
            // Invincibility glow
            ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
            ctx.fillRect(this.car.x - 10, this.car.y - 10,
                this.car.width + 20, this.car.height + 20);
        }

        ctx.fillStyle = '#00d4ff';
        ctx.fillRect(this.car.x, this.car.y, this.car.width, this.car.height);
        ctx.font = '32px Arial';
        ctx.fillText('🚗', this.car.x + 20, this.car.y + 40);

        // Invincibility indicator
        if (this.invincibilityTimer > 0) {
            ctx.fillStyle = '#00ff88';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            const seconds = Math.ceil(this.invincibilityTimer / 1000);
            ctx.fillText(`⭐ INVINCIBLE: ${seconds}s ⭐`, 640, 50);
        }
    }
};

// ==========================================
// INPUT HANDLING
// ==========================================
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    // Story skip
    if (gameState === 'STORY' && (e.key === ' ' || e.key === 'Enter')) {
        gameState = 'PLAYING';
        racingGame.init();
        hideAllScreens();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// ==========================================
// UI FUNCTIONS
// ==========================================
function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('game-hud').classList.add('hidden');
}

function showScreen(screenId) {
    hideAllScreens();
    document.getElementById(screenId).classList.add('active');
}

function updateHUD() {
    document.getElementById('health').textContent = playerHealth;
    document.getElementById('collectibles').textContent =
        `${collectiblesGathered}/${CHAPTERS[currentChapter].collectiblesNeeded}`;
    document.getElementById('level-name').textContent = CHAPTERS[currentChapter].title;
}

// ==========================================
// LEVEL SELECT
// ==========================================
function populateLevelSelect() {
    const grid = document.getElementById('levels-grid');
    grid.innerHTML = '';

    // Add all 7 chapters
    for (let i = 1; i <= 7; i++) {
        const btn = document.createElement('button');
        btn.className = 'pixel-btn level-btn';
        btn.innerHTML = `Chapter ${i}`;

        if (i === 1) {
            // Only Chapter 1 is playable for now
            btn.addEventListener('click', () => {
                currentChapter = 1;
                playerHealth = 5;
                storyLines = CHAPTERS[1].story;
                currentStoryLine = 0;
                storyTimer = 0;
                gameState = 'STORY';
                hideAllScreens();
            });
        } else {
            // Other chapters coming soon
            btn.style.opacity = '0.5';
            btn.addEventListener('click', () => {
                alert('Coming soon! Only Chapter 1 is available for now.');
            });
        }

        grid.appendChild(btn);
    }
}

// Back button from level select
document.getElementById('back-to-menu').addEventListener('click', () => {
    showScreen('title-screen');
});

// ==========================================
// GAME LOOP
// ==========================================
let lastTime = 0;

function gameLoop(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 1280, 720);

    if (gameState === 'STORY') {
        drawStory();
    }
    else if (gameState === 'PLAYING') {
        racingGame.update(dt);
        racingGame.draw();
        document.getElementById('game-hud').classList.remove('hidden');
    }
    else if (gameState === 'VICTORY') {
        showScreen('victory-screen');
        const msg = CHAPTERS[currentChapter].title + " Complete!\\n\\nYou collected all the parts and overcame the doubts!";
        document.getElementById('victory-message').innerHTML = msg.replace(/\\n/g, '<br>');
    }
    else if (gameState === 'GAMEOVER') {
        showScreen('gameover-screen');
    }

    requestAnimationFrame(gameLoop);
}

function drawStory() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = '#fff';
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';

    if (currentStoryLine < storyLines.length) {
        ctx.fillText(storyLines[currentStoryLine], 640, 360);

        // Auto-advance every 3 seconds
        storyTimer += 16;
        if (storyTimer > 3000) {
            currentStoryLine++;
            storyTimer = 0;
        }
    } else {
        // Story complete, start game
        gameState = 'PLAYING';
        racingGame.init();
    }

    // Skip instruction
    ctx.font = '16px Arial';
    ctx.fillStyle = '#888';
    ctx.fillText('Press SPACE to skip', 640, 680);
}

// ==========================================
// BUTTON HANDLERS
// ==========================================
document.getElementById('start-btn').addEventListener('click', () => {
    currentChapter = 1;
    playerHealth = 5;
    storyLines = CHAPTERS[1].story;
    currentStoryLine = 0;
    storyTimer = 0;
    gameState = 'STORY';
    hideAllScreens();
});

document.getElementById('retry-btn').addEventListener('click', () => {
    playerHealth = 5;
    gameState = 'PLAYING';
    racingGame.init();
    hideAllScreens();
});

document.getElementById('gameover-menu-btn').addEventListener('click', () => {
    gameState = 'TITLE';
    showScreen('title-screen');
});

// Victory screen buttons
document.getElementById('next-level-btn').addEventListener('click', () => {
    // For now, just restart chapter 1 (can add more chapters later)
    currentChapter = 1;
    playerHealth = 5;
    storyLines = CHAPTERS[1].story;
    currentStoryLine = 0;
    storyTimer = 0;
    gameState = 'STORY';
    hideAllScreens();
});

document.getElementById('back-to-levels-btn').addEventListener('click', () => {
    gameState = 'TITLE';
    showScreen('title-screen');
});

// Title screen buttons
document.getElementById('levels-btn').addEventListener('click', () => {
    // Show level select screen
    showScreen('level-select-screen');
    populateLevelSelect();
});

document.getElementById('unlock-btn').addEventListener('click', () => {
    // Unlock all - just start game
    currentChapter = 1;
    playerHealth = 5;
    storyLines = CHAPTERS[1].story;
    currentStoryLine = 0;
    storyTimer = 0;
    gameState = 'STORY';
    hideAllScreens();
});

// ==========================================
// START
// ==========================================
showScreen('title-screen');
requestAnimationFrame(gameLoop);
