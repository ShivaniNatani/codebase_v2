// ==========================================
// THE LEGEND OF ARGHA - COMPLETE 7 CHAPTERS
// Valentine's Week Special Edition
// ==========================================

// Game state
let gameState = 'TITLE';
let currentChapter = 0;
let playerHealth = 5;
let playerScore = 0;
let collectiblesGathered = 0;
let storyLines = [];
let currentStoryLine = 0;
let storyTimer = 0;

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1280;
canvas.height = 720;

// Input handling
const keys = {};
let mouseX = 0, mouseY = 0, mouseClicked = false;

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (gameState === 'STORY' && (e.key === ' ' || e.key === 'Enter')) {
        startCurrentChapter();
    }
});
document.addEventListener('keyup', (e) => keys[e.key] = false);
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});
document.addEventListener('click', () => mouseClicked = true);

// ==========================================
// ALL CHAPTER DATA
// ==========================================
const CHAPTERS = {
    1: {
        title: "CHAPTER 1: THE JOURNEY",
        subtitle: "College Days",
        gameType: 'racing',
        story: [
            "Once upon a time, in a small town in Bijnor...",
            "There was a boy who wasn't the best at studies.",
            "But he had something special - a passion for technology.",
            "College was fun. Biryanis. Friends. Driving trucks.",
            "He was the macho guy everyone looked up to.",
            "Time to drive to Bangalore and chase dreams..."
        ],
        collectiblesNeeded: 10
    },
    2: {
        title: "CHAPTER 2: THE COOK",
        subtitle: "Learning to Cook for Her",
        gameType: 'cooking',
        story: [
            "She loved good food...",
            "And he decided to learn cooking just for her.",
            "Biryanis became his specialty.",
            "Each dish made with love...",
            "Time to prepare the perfect meal!"
        ],
        collectiblesNeeded: 5
    },
    3: {
        title: "CHAPTER 3: THE HUSTLE",
        subtitle: "30km Daily, Teaching Java",
        gameType: 'runner',
        story: [
            "Life in Bangalore wasn't easy...",
            "30 kilometers daily on a bike.",
            "Teaching Java to students.",
            "Balancing work, travel, and dreams.",
            "Keep running, never give up!"
        ],
        collectiblesNeeded: 8
    },
    4: {
        title: "CHAPTER 4: THE HACKER",
        subtitle: "Proving Technical Skills",
        gameType: 'hacker',
        story: [
            "To win her heart, he had to prove himself...",
            "Not just with words, but with code.",
            "Every bug fixed, every problem solved.",
            "The terminal was his battlefield.",
            "Time to hack through the challenges!"
        ],
        collectiblesNeeded: 4
    },
    5: {
        title: "CHAPTER 5: THE CONFESSION",
        subtitle: "First Date & Proposal",
        gameType: 'confession',
        story: [
            "The moment had arrived...",
            "Months of preparation led to this.",
            "A nervous heart, sweaty palms.",
            "But love gave him courage.",
            "Time to confess your feelings..."
        ],
        collectiblesNeeded: 3
    },
    6: {
        title: "CHAPTER 6: THE CELEBRATION",
        subtitle: "Wedding Preparations",
        gameType: 'wedding',
        story: [
            "She said YES!",
            "Now came the wedding preparations.",
            "Guests, decorations, music, food...",
            "So much to coordinate!",
            "Make this wedding perfect!"
        ],
        collectiblesNeeded: 6
    },
    7: {
        title: "CHAPTER 7: HAPPILY EVER AFTER",
        subtitle: "The Grand Finale",
        gameType: 'finale',
        story: [
            "And so the journey comes full circle...",
            "From a small town boy with big dreams...",
            "To a man who found love and success.",
            "Every obstacle was worth it.",
            "Every struggle led to this moment...",
            "Happy Valentine's Week, my love! ❤️"
        ],
        collectiblesNeeded: 0
    }
};

// ==========================================
// CHAPTER 1: RACING GAME
// ==========================================
const racingGame = {
    car: { x: 640, y: 600, width: 40, height: 60, lane: 1, speed: 8 },
    lanes: [373, 640, 907],
    obstacles: [],
    collectibles: [],
    roadOffset: 0,
    spawnTimer: 0,
    collectibleTimer: 0,
    invincibilityTimer: 5000,
    hitCooldown: 0,
    lastObstacleLane: -1,

    init() {
        this.car.lane = 1;
        this.car.x = this.lanes[1];
        this.obstacles = [];
        this.collectibles = [];
        this.spawnTimer = 3000;
        this.collectibleTimer = 1500;
        this.invincibilityTimer = 5000;
        this.hitCooldown = 0;
        playerScore = 0;
        collectiblesGathered = 0;
    },

    update(dt) {
        if (this.invincibilityTimer > 0) this.invincibilityTimer -= dt;
        if (this.hitCooldown > 0) this.hitCooldown -= dt;
        this.spawnTimer -= dt;
        this.collectibleTimer -= dt;

        if (keys['ArrowLeft'] && this.car.lane > 0) { this.car.lane--; keys['ArrowLeft'] = false; }
        if (keys['ArrowRight'] && this.car.lane < 2) { this.car.lane++; keys['ArrowRight'] = false; }

        this.car.x += (this.lanes[this.car.lane] - this.car.x) * 0.2;
        this.roadOffset = (this.roadOffset + this.car.speed) % 50;

        if (this.spawnTimer <= 0) { this.spawnObstacle(); this.spawnTimer = 2500; }
        if (this.collectibleTimer <= 0) { this.spawnCollectible(); this.collectibleTimer = 1800; }

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            this.obstacles[i].y += this.car.speed;
            if (this.obstacles[i].y > 720) { this.obstacles.splice(i, 1); continue; }
            if (this.invincibilityTimer <= 0 && this.hitCooldown <= 0 && this.checkCollision(this.car, this.obstacles[i])) {
                this.hit();
                this.obstacles.splice(i, 1);
            }
        }

        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            this.collectibles[i].y += this.car.speed;
            if (this.collectibles[i].y > 720) { this.collectibles.splice(i, 1); continue; }
            if (this.checkCollision(this.car, this.collectibles[i])) {
                collectiblesGathered++;
                playerScore += 100;
                updateHUD();
                this.collectibles.splice(i, 1);
            }
        }

        if (collectiblesGathered >= CHAPTERS[currentChapter].collectiblesNeeded) gameState = 'VICTORY';
    },

    spawnObstacle() {
        const lane = Math.floor(Math.random() * 3);
        this.lastObstacleLane = lane;
        this.obstacles.push({ x: this.lanes[lane], y: -100, width: 80, height: 80, label: ['DOUBT', 'FEAR', "CAN'T", "WON'T"][Math.floor(Math.random() * 4)] });
    },

    spawnCollectible() {
        let lane;
        do { lane = Math.floor(Math.random() * 3); } while (lane === this.lastObstacleLane);
        this.collectibles.push({ x: this.lanes[lane], y: -100, width: 40, height: 40 });
    },

    checkCollision(a, b) { return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y; },
    hit() { playerHealth--; this.hitCooldown = 1000; updateHUD(); if (playerHealth <= 0) gameState = 'GAMEOVER'; },

    draw() {
        ctx.fillStyle = '#2a2a2a'; ctx.fillRect(0, 0, 1280, 720);
        ctx.strokeStyle = '#ffff00'; ctx.lineWidth = 4; ctx.setLineDash([20, 20]);
        for (let i = 0; i < 800; i += 50) {
            ctx.beginPath(); ctx.moveTo(520, i - this.roadOffset); ctx.lineTo(520, i - this.roadOffset + 30); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(760, i - this.roadOffset); ctx.lineTo(760, i - this.roadOffset + 30); ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0, 0, 200, 720); ctx.fillRect(1080, 0, 200, 720);

        this.obstacles.forEach(obs => {
            ctx.fillStyle = '#ff4757'; ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center'; ctx.fillText(obs.label, obs.x + 40, obs.y + 45);
        });
        this.collectibles.forEach(col => { ctx.font = '32px Arial'; ctx.textAlign = 'center'; ctx.fillText('💻', col.x + 20, col.y + 30); });

        if (this.invincibilityTimer > 0) { ctx.fillStyle = 'rgba(0, 255, 136, 0.3)'; ctx.fillRect(this.car.x - 10, this.car.y - 10, 60, 80); }
        ctx.fillStyle = '#00d4ff'; ctx.fillRect(this.car.x, this.car.y, this.car.width, this.car.height);
        ctx.font = '32px Arial'; ctx.fillText('🚗', this.car.x + 20, this.car.y + 40);
        if (this.invincibilityTimer > 0) { ctx.fillStyle = '#00ff88'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center'; ctx.fillText(`⭐ INVINCIBLE: ${Math.ceil(this.invincibilityTimer / 1000)}s ⭐`, 640, 50); }
    }
};

// ==========================================
// CHAPTER 2: COOKING GAME
// ==========================================
const cookingGame = {
    ingredients: [],
    recipe: [],
    currentStep: 0,
    timer: 30000,
    selectedIngredient: -1,

    init() {
        this.recipe = ['🍚 Rice', '🧅 Onion', '🍖 Chicken', '🌶️ Spices', '🧈 Ghee'];
        this.ingredients = ['🧅 Onion', '🍖 Chicken', '🌶️ Spices', '🧈 Ghee', '🍚 Rice', '🥕 Carrot', '🍅 Tomato', '🧄 Garlic'];
        this.shuffleArray(this.ingredients);
        this.currentStep = 0;
        this.timer = 30000;
        collectiblesGathered = 0;
    },

    shuffleArray(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; } },

    update(dt) {
        this.timer -= dt;
        if (this.timer <= 0) gameState = 'GAMEOVER';

        if (mouseClicked) {
            mouseClicked = false;
            const gridX = 200, gridY = 300, itemW = 120, itemH = 80;
            for (let i = 0; i < this.ingredients.length; i++) {
                const x = gridX + (i % 4) * (itemW + 20);
                const y = gridY + Math.floor(i / 4) * (itemH + 20);
                if (mouseX >= x && mouseX <= x + itemW && mouseY >= y && mouseY <= y + itemH) {
                    if (this.ingredients[i] === this.recipe[this.currentStep]) {
                        this.currentStep++;
                        collectiblesGathered++;
                        updateHUD();
                        if (this.currentStep >= this.recipe.length) gameState = 'VICTORY';
                    } else {
                        playerHealth--;
                        updateHUD();
                        if (playerHealth <= 0) gameState = 'GAMEOVER';
                    }
                }
            }
        }
    },

    draw() {
        ctx.fillStyle = '#4a2c2a'; ctx.fillRect(0, 0, 1280, 720);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 32px Arial'; ctx.textAlign = 'center';
        ctx.fillText('🍳 MAKE THE PERFECT BIRYANI! 🍳', 640, 60);

        ctx.font = '24px Arial';
        ctx.fillText(`Current Step: ${this.recipe[this.currentStep] || 'DONE!'}`, 640, 120);
        ctx.fillText(`Time: ${Math.ceil(this.timer / 1000)}s`, 640, 160);

        const gridX = 200, gridY = 300, itemW = 120, itemH = 80;
        this.ingredients.forEach((ing, i) => {
            const x = gridX + (i % 4) * (itemW + 20);
            const y = gridY + Math.floor(i / 4) * (itemH + 20);
            ctx.fillStyle = '#8b5a2b'; ctx.fillRect(x, y, itemW, itemH);
            ctx.strokeStyle = '#d4a574'; ctx.lineWidth = 3; ctx.strokeRect(x, y, itemW, itemH);
            ctx.fillStyle = '#fff'; ctx.font = '16px Arial'; ctx.fillText(ing, x + itemW / 2, y + itemH / 2 + 5);
        });

        ctx.fillStyle = '#ffd700'; ctx.font = '18px Arial';
        ctx.fillText('Click the correct ingredient in order!', 640, 600);
    }
};

// ==========================================
// CHAPTER 3: RUNNER GAME
// ==========================================
const runnerGame = {
    player: { x: 200, y: 500, vy: 0, jumping: false },
    obstacles: [],
    collectibles: [],
    speed: 5,
    distance: 0,
    spawnTimer: 0,

    init() {
        this.player = { x: 200, y: 500, vy: 0, jumping: false };
        this.obstacles = [];
        this.collectibles = [];
        this.speed = 5;
        this.distance = 0;
        this.spawnTimer = 0;
        collectiblesGathered = 0;
    },

    update(dt) {
        // Jump
        if ((keys[' '] || keys['ArrowUp']) && !this.player.jumping) {
            this.player.vy = -15;
            this.player.jumping = true;
        }

        // Gravity
        this.player.vy += 0.8;
        this.player.y += this.player.vy;
        if (this.player.y >= 500) { this.player.y = 500; this.player.jumping = false; this.player.vy = 0; }

        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            if (Math.random() < 0.6) this.obstacles.push({ x: 1300, y: 480, w: 50, h: 60 });
            else this.collectibles.push({ x: 1300, y: 400, w: 40, h: 40 });
            this.spawnTimer = 1500;
        }

        this.obstacles.forEach(obs => obs.x -= this.speed);
        this.collectibles.forEach(col => col.x -= this.speed);
        this.obstacles = this.obstacles.filter(obs => obs.x > -50);
        this.collectibles = this.collectibles.filter(col => col.x > -50);

        // Collision
        this.obstacles.forEach((obs, i) => {
            if (this.player.x < obs.x + obs.w && this.player.x + 40 > obs.x && this.player.y < obs.y + obs.h && this.player.y + 60 > obs.y) {
                playerHealth--;
                updateHUD();
                this.obstacles.splice(i, 1);
                if (playerHealth <= 0) gameState = 'GAMEOVER';
            }
        });

        this.collectibles.forEach((col, i) => {
            if (this.player.x < col.x + col.w && this.player.x + 40 > col.x && this.player.y < col.y + col.h && this.player.y + 60 > col.y) {
                collectiblesGathered++;
                updateHUD();
                this.collectibles.splice(i, 1);
                if (collectiblesGathered >= CHAPTERS[currentChapter].collectiblesNeeded) gameState = 'VICTORY';
            }
        });

        this.distance += this.speed;
    },

    draw() {
        // Sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 720);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1280, 720);

        // Ground
        ctx.fillStyle = '#3d5c3d';
        ctx.fillRect(0, 560, 1280, 160);

        // Buildings in background
        ctx.fillStyle = '#666';
        for (let i = 0; i < 10; i++) ctx.fillRect(i * 150, 400, 80, 160);

        // Player
        ctx.fillStyle = '#00d4ff';
        ctx.fillRect(this.player.x, this.player.y, 40, 60);
        ctx.font = '40px Arial';
        ctx.fillText('🏃', this.player.x + 20, this.player.y + 45);

        // Obstacles
        this.obstacles.forEach(obs => {
            ctx.fillStyle = '#ff4757';
            ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
            ctx.font = '20px Arial';
            ctx.fillText('🚧', obs.x + 25, obs.y + 40);
        });

        // Collectibles
        this.collectibles.forEach(col => {
            ctx.font = '32px Arial';
            ctx.fillText('📚', col.x + 20, col.y + 30);
        });

        ctx.fillStyle = '#000';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE or ↑ to JUMP!', 640, 50);
        ctx.fillText(`Distance: ${Math.floor(this.distance)}m`, 640, 90);
    }
};

// ==========================================
// CHAPTER 4: HACKER GAME
// ==========================================
const hackerGame = {
    challenges: [],
    currentChallenge: 0,
    input: '',
    message: '',
    cursorBlink: 0,

    init() {
        this.challenges = [
            { question: 'DECRYPT: ORYY → ?', answer: 'BELL', hint: 'ROT13 cipher' },
            { question: 'FIX BUG: console.log("Hello World)', answer: 'console.log("Hello World")', hint: 'Missing quote' },
            { question: 'BINARY: 01001000 01001001 = ?', answer: 'HI', hint: 'ASCII conversion' },
            { question: 'SQL: SELECT * FROM love WHERE name = ?', answer: 'SHIVANI', hint: 'Who do you love?' }
        ];
        this.currentChallenge = 0;
        this.input = '';
        this.message = 'Type your answer and press ENTER';
        collectiblesGathered = 0;
    },

    update(dt) {
        this.cursorBlink = (this.cursorBlink + dt) % 1000;

        // Handle typing
        for (let key in keys) {
            if (keys[key] && key.length === 1) {
                this.input += key.toUpperCase();
                keys[key] = false;
            }
        }
        if (keys['Backspace']) { this.input = this.input.slice(0, -1); keys['Backspace'] = false; }
        if (keys['Enter']) {
            keys['Enter'] = false;
            if (this.input.toUpperCase() === this.challenges[this.currentChallenge].answer.toUpperCase()) {
                this.message = '✅ ACCESS GRANTED!';
                this.currentChallenge++;
                collectiblesGathered++;
                updateHUD();
                this.input = '';
                if (this.currentChallenge >= this.challenges.length) {
                    setTimeout(() => gameState = 'VICTORY', 1000);
                }
            } else {
                this.message = '❌ ACCESS DENIED - Try again!';
                playerHealth--;
                updateHUD();
                if (playerHealth <= 0) gameState = 'GAMEOVER';
            }
        }
    },

    draw() {
        // Terminal background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, 1280, 720);

        // Matrix rain effect (simplified)
        ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
        ctx.font = '14px monospace';
        for (let i = 0; i < 50; i++) {
            ctx.fillText(String.fromCharCode(33 + Math.random() * 93), Math.random() * 1280, Math.random() * 720);
        }

        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('[ SYSTEM BREACH IN PROGRESS ]', 640, 60);
        ctx.fillText(`Challenge ${this.currentChallenge + 1}/${this.challenges.length}`, 640, 100);

        if (this.currentChallenge < this.challenges.length) {
            const ch = this.challenges[this.currentChallenge];
            ctx.font = '24px monospace';
            ctx.fillText(ch.question, 640, 200);
            ctx.fillStyle = '#888';
            ctx.font = '18px monospace';
            ctx.fillText(`Hint: ${ch.hint}`, 640, 240);

            // Input box
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(340, 300, 600, 60);
            ctx.fillStyle = '#00ff00';
            ctx.font = '24px monospace';
            const cursor = this.cursorBlink < 500 ? '_' : '';
            ctx.fillText(`> ${this.input}${cursor}`, 360, 340);
        }

        ctx.fillStyle = this.message.includes('✅') ? '#00ff00' : '#ff4757';
        ctx.font = 'bold 24px monospace';
        ctx.fillText(this.message, 640, 450);

        ctx.fillStyle = '#00ff00';
        ctx.font = '16px monospace';
        ctx.fillText('Type answer + ENTER | BACKSPACE to delete', 640, 650);
    }
};

// ==========================================
// CHAPTER 5: CONFESSION GAME (Visual Novel)
// ==========================================
const confessionGame = {
    dialogues: [],
    currentDialogue: 0,
    choices: [],
    showingChoices: false,
    score: 0,

    init() {
        this.dialogues = [
            { text: "You're standing outside the restaurant...", speaker: 'narrator' },
            { text: "Your heart is pounding. This is it.", speaker: 'narrator' },
            { text: "She arrives, looking beautiful as always.", speaker: 'narrator' },
            { text: "What do you say first?", speaker: 'choice', options: ['Tell her she looks amazing', 'Nervously wave hello', 'Run away'] },
            { text: "She smiles. The evening goes perfectly.", speaker: 'narrator' },
            { text: "After dinner, you walk in the moonlight...", speaker: 'narrator' },
            { text: "How do you confess?", speaker: 'choice', options: ['I love you, Shivani', 'Will you be my Valentine forever?', 'Stay silent'] },
            { text: "Her eyes light up with tears of joy.", speaker: 'narrator' },
            { text: '"Yes! Yes! A thousand times yes!"', speaker: 'her' },
            { text: "And in that moment, two hearts became one. ❤️", speaker: 'narrator' }
        ];
        this.currentDialogue = 0;
        this.showingChoices = false;
        this.score = 0;
        collectiblesGathered = 0;
    },

    update(dt) {
        if (mouseClicked) {
            mouseClicked = false;
            const d = this.dialogues[this.currentDialogue];

            if (d.speaker === 'choice' && this.showingChoices) {
                // Check which option was clicked
                for (let i = 0; i < d.options.length; i++) {
                    const y = 400 + i * 70;
                    if (mouseY >= y && mouseY <= y + 50 && mouseX >= 340 && mouseX <= 940) {
                        if (i < 2) { this.score++; collectiblesGathered++; updateHUD(); }
                        else { playerHealth--; updateHUD(); }
                        this.showingChoices = false;
                        this.currentDialogue++;
                        if (this.currentDialogue >= this.dialogues.length) gameState = 'VICTORY';
                        if (playerHealth <= 0) gameState = 'GAMEOVER';
                    }
                }
            } else if (d.speaker !== 'choice') {
                this.currentDialogue++;
                if (this.currentDialogue >= this.dialogues.length) gameState = 'VICTORY';
            } else {
                this.showingChoices = true;
            }
        }
    },

    draw() {
        // Romantic background
        const gradient = ctx.createLinearGradient(0, 0, 0, 720);
        gradient.addColorStop(0, '#1a0a2e');
        gradient.addColorStop(1, '#3d1a5c');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1280, 720);

        // Stars
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 100; i++) {
            const x = (i * 127) % 1280;
            const y = (i * 83) % 400;
            ctx.beginPath();
            ctx.arc(x, y, Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Moon
        ctx.beginPath();
        ctx.arc(1100, 100, 60, 0, Math.PI * 2);
        ctx.fillStyle = '#fffacd';
        ctx.fill();

        const d = this.dialogues[this.currentDialogue];
        if (!d) return;

        // Dialogue box
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(100, 500, 1080, 180);
        ctx.strokeStyle = '#ff69b4';
        ctx.lineWidth = 3;
        ctx.strokeRect(100, 500, 1080, 180);

        ctx.fillStyle = '#fff';
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(d.text, 640, 570);

        if (d.speaker === 'choice' && this.showingChoices) {
            d.options.forEach((opt, i) => {
                const y = 400 + i * 70;
                ctx.fillStyle = '#ff69b4';
                ctx.fillRect(340, y, 600, 50);
                ctx.fillStyle = '#fff';
                ctx.font = '20px Arial';
                ctx.fillText(opt, 640, y + 32);
            });
        }

        ctx.fillStyle = '#ff69b4';
        ctx.font = '16px Arial';
        ctx.fillText('Click to continue...', 640, 700);
    }
};

// ==========================================
// CHAPTER 6: WEDDING MEMORY GAME
// ==========================================
const weddingGame = {
    cards: [],
    flipped: [],
    matched: 0,
    canFlip: true,

    init() {
        const items = ['👰', '🤵', '💍', '🎂', '🌹', '💒'];
        this.cards = [...items, ...items].map((emoji, i) => ({ emoji, flipped: false, matched: false, id: i }));
        this.shuffleArray(this.cards);
        this.flipped = [];
        this.matched = 0;
        this.canFlip = true;
        collectiblesGathered = 0;
    },

    shuffleArray(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; } },

    update(dt) {
        if (mouseClicked && this.canFlip) {
            mouseClicked = false;
            const cols = 4, rows = 3, cardW = 150, cardH = 150;
            const startX = (1280 - cols * (cardW + 20)) / 2;
            const startY = 180;

            for (let i = 0; i < this.cards.length; i++) {
                const x = startX + (i % cols) * (cardW + 20);
                const y = startY + Math.floor(i / cols) * (cardH + 20);
                if (mouseX >= x && mouseX <= x + cardW && mouseY >= y && mouseY <= y + cardH) {
                    if (!this.cards[i].flipped && !this.cards[i].matched) {
                        this.cards[i].flipped = true;
                        this.flipped.push(i);

                        if (this.flipped.length === 2) {
                            this.canFlip = false;
                            const [a, b] = this.flipped;
                            if (this.cards[a].emoji === this.cards[b].emoji) {
                                this.cards[a].matched = this.cards[b].matched = true;
                                this.matched++;
                                collectiblesGathered++;
                                updateHUD();
                                this.flipped = [];
                                this.canFlip = true;
                                if (this.matched >= 6) gameState = 'VICTORY';
                            } else {
                                setTimeout(() => {
                                    this.cards[a].flipped = this.cards[b].flipped = false;
                                    this.flipped = [];
                                    this.canFlip = true;
                                }, 1000);
                            }
                        }
                    }
                }
            }
        }
    },

    draw() {
        // Festive background
        const gradient = ctx.createLinearGradient(0, 0, 0, 720);
        gradient.addColorStop(0, '#ff9a9e');
        gradient.addColorStop(1, '#fecfef');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1280, 720);

        ctx.fillStyle = '#8b0000';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('💒 WEDDING MEMORY MATCH 💒', 640, 80);
        ctx.font = '24px Arial';
        ctx.fillText(`Matches: ${this.matched}/6`, 640, 130);

        const cols = 4, rows = 3, cardW = 150, cardH = 150;
        const startX = (1280 - cols * (cardW + 20)) / 2;
        const startY = 180;

        this.cards.forEach((card, i) => {
            const x = startX + (i % cols) * (cardW + 20);
            const y = startY + Math.floor(i / cols) * (cardH + 20);

            if (card.matched) {
                ctx.fillStyle = '#90EE90';
            } else if (card.flipped) {
                ctx.fillStyle = '#fff';
            } else {
                ctx.fillStyle = '#8b0000';
            }
            ctx.fillRect(x, y, cardW, cardH);
            ctx.strokeStyle = '#5c0000';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, cardW, cardH);

            if (card.flipped || card.matched) {
                ctx.font = '60px Arial';
                ctx.fillText(card.emoji, x + cardW / 2, y + cardH / 2 + 20);
            } else {
                ctx.fillStyle = '#fff';
                ctx.font = '40px Arial';
                ctx.fillText('?', x + cardW / 2, y + cardH / 2 + 15);
            }
        });
    }
};

// ==========================================
// CHAPTER 7: FINALE (Slideshow)
// ==========================================
const finaleGame = {
    slides: [],
    currentSlide: 0,
    timer: 0,

    init() {
        this.slides = [
            { text: "From a small town boy with big dreams...", emoji: "🏠" },
            { text: "To conquering Bangalore's tech world...", emoji: "💻" },
            { text: "Learning to cook biryanis for love...", emoji: "🍳" },
            { text: "Running 30km daily, never giving up...", emoji: "🏃" },
            { text: "Proving yourself through code...", emoji: "⌨️" },
            { text: "Finding the courage to confess...", emoji: "💕" },
            { text: "Planning the perfect wedding...", emoji: "💒" },
            { text: "And finally...", emoji: "✨" },
            { text: "HAPPILY EVER AFTER", emoji: "❤️" },
            { text: "Happy Valentine's Week 2026!", emoji: "🎉" },
            { text: "Made with love for Shivani ❤️", emoji: "💝" }
        ];
        this.currentSlide = 0;
        this.timer = 0;
        collectiblesGathered = CHAPTERS[7].collectiblesNeeded; // Auto-complete
    },

    update(dt) {
        this.timer += dt;
        if (this.timer > 4000) {
            this.timer = 0;
            this.currentSlide++;
            if (this.currentSlide >= this.slides.length) {
                gameState = 'VICTORY';
            }
        }

        if (mouseClicked) {
            mouseClicked = false;
            this.currentSlide++;
            this.timer = 0;
            if (this.currentSlide >= this.slides.length) {
                gameState = 'VICTORY';
            }
        }
    },

    draw() {
        // Romantic gradient
        const gradient = ctx.createRadialGradient(640, 360, 0, 640, 360, 600);
        gradient.addColorStop(0, '#ff69b4');
        gradient.addColorStop(1, '#1a0a2e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1280, 720);

        // Hearts background
        ctx.font = '30px Arial';
        for (let i = 0; i < 20; i++) {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.2})`;
            ctx.fillText('❤️', (i * 137) % 1280, (i * 89 + this.timer * 0.02) % 720);
        }

        const slide = this.slides[this.currentSlide];
        if (!slide) return;

        ctx.font = '100px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(slide.emoji, 640, 280);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px Arial';
        ctx.fillText(slide.text, 640, 450);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '20px Arial';
        ctx.fillText(`${this.currentSlide + 1} / ${this.slides.length}`, 640, 650);
        ctx.fillText('Click to continue...', 640, 690);
    }
};

// ==========================================
// GAME CONTROLLER
// ==========================================
function startCurrentChapter() {
    gameState = 'PLAYING';
    collectiblesGathered = 0;
    const game = getCurrentGame();
    if (game) game.init();
    hideAllScreens();
}

function getCurrentGame() {
    if (!CHAPTERS[currentChapter]) return null;
    switch (CHAPTERS[currentChapter].gameType) {
        case 'racing': return racingGame;
        case 'cooking': return cookingGame;
        case 'runner': return runnerGame;
        case 'hacker': return hackerGame;
        case 'confession': return confessionGame;
        case 'wedding': return weddingGame;
        case 'finale': return finaleGame;
        default: return null;
    }
}

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
    const needed = CHAPTERS[currentChapter]?.collectiblesNeeded || 0;
    document.getElementById('collectibles').textContent = `${collectiblesGathered}/${needed}`;
    document.getElementById('level-name').textContent = CHAPTERS[currentChapter]?.title || '';
}

function populateLevelSelect() {
    const grid = document.getElementById('levels-grid');
    grid.innerHTML = '';
    for (let i = 1; i <= 7; i++) {
        const btn = document.createElement('button');
        btn.className = 'pixel-btn level-btn';
        btn.innerHTML = `<strong>Chapter ${i}</strong><br>${CHAPTERS[i].subtitle}`;
        btn.style.padding = '15px';
        btn.style.margin = '10px';
        btn.addEventListener('click', () => {
            currentChapter = i;
            playerHealth = 5;
            storyLines = CHAPTERS[i].story;
            currentStoryLine = 0;
            storyTimer = 0;
            gameState = 'STORY';
            hideAllScreens();
        });
        grid.appendChild(btn);
    }
}

// ==========================================
// GAME LOOP
// ==========================================
let lastTime = 0;

function gameLoop(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 1280, 720);

    if (gameState === 'STORY') {
        drawStory();
    } else if (gameState === 'PLAYING') {
        const game = getCurrentGame();
        if (game) { game.update(dt); game.draw(); }
        document.getElementById('game-hud').classList.remove('hidden');
    } else if (gameState === 'VICTORY') {
        showScreen('victory-screen');
        let msg = `${CHAPTERS[currentChapter]?.title || 'Chapter'} Complete!`;
        if (currentChapter === 7) msg = "🎉 THE END 🎉\n\nThank you for playing!\nHappy Valentine's Week!";
        document.getElementById('victory-message').innerHTML = msg.replace(/\n/g, '<br>');
    } else if (gameState === 'GAMEOVER') {
        showScreen('gameover-screen');
    }

    mouseClicked = false;
    requestAnimationFrame(gameLoop);
}

function drawStory() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = '#ff69b4';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(CHAPTERS[currentChapter]?.title || '', 640, 100);

    ctx.fillStyle = '#fff';
    ctx.font = '28px Arial';
    if (currentStoryLine < storyLines.length) {
        ctx.fillText(storyLines[currentStoryLine], 640, 360);
        storyTimer += 16;
        if (storyTimer > 3000) { currentStoryLine++; storyTimer = 0; }
    } else {
        startCurrentChapter();
    }

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
    collectiblesGathered = 0;
    gameState = 'PLAYING';
    getCurrentGame()?.init();
    hideAllScreens();
});

document.getElementById('gameover-menu-btn').addEventListener('click', () => {
    gameState = 'TITLE';
    showScreen('title-screen');
});

document.getElementById('next-level-btn').addEventListener('click', () => {
    if (currentChapter < 7) {
        currentChapter++;
        playerHealth = 5;
        storyLines = CHAPTERS[currentChapter].story;
        currentStoryLine = 0;
        storyTimer = 0;
        gameState = 'STORY';
        hideAllScreens();
    } else {
        gameState = 'TITLE';
        showScreen('title-screen');
    }
});

document.getElementById('back-to-levels-btn').addEventListener('click', () => {
    showScreen('level-select-screen');
    populateLevelSelect();
});

document.getElementById('levels-btn').addEventListener('click', () => {
    showScreen('level-select-screen');
    populateLevelSelect();
});

document.getElementById('unlock-btn').addEventListener('click', () => {
    showScreen('level-select-screen');
    populateLevelSelect();
});

document.getElementById('back-to-menu').addEventListener('click', () => {
    showScreen('title-screen');
});

// ==========================================
// START
// ==========================================
showScreen('title-screen');
requestAnimationFrame(gameLoop);
