// MainMenu 
class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    preload() {
        this.load.image('title', 'assets/title.png');
        this.load.image('playbutton', 'assets/playbutton.png');
        this.load.image('quitbutton', 'assets/quitbutton.png');
    }

    create() {
        this.add.image(400, 300, 'title').setDisplaySize(800, 600);

        const playButton = this.add.image(400, 400, 'playbutton')
            .setDisplaySize(200, 80)
            .setInteractive();

        const quitButton = this.add.image(400, 500, 'quitbutton')
            .setDisplaySize(200, 80)
            .setInteractive();

        playButton.on('pointerdown', () => {
            this.scene.start('LevelSelect');
        });

        quitButton.on('pointerdown', () => {
            this.add.text(250, 550, 'Thanks for playing!', { fontSize: '28px', fill: '#fff' });
        });
    }
}

// LevelSelector
class LevelSelect extends Phaser.Scene {
    constructor() {
        super('LevelSelect');
    }

    create() {
        const textStyle = { font: '32px Arial', fill: '#ffffff' };

        this.add.text(300, 100, 'Select a Level:', textStyle);

        for (let i = 1; i <= 5; i++) {
            const levelText = this.add.text(350, 150 + i * 50, 'Level ' + i, textStyle).setInteractive();

            levelText.on('pointerdown', () => {
                this.scene.start('Level' + i);
            });
        }
    }
}

// Level 1 
class Level1 extends Phaser.Scene {
    constructor() {
        super('Level1');
    }

    preload() {
        // Load images and sounds used in Level 1
        this.load.image('background', 'assets/background.png');
        this.load.image('player', 'assets/player.png');
        this.load.image('eye', 'assets/eye.png');
        this.load.image('door', 'assets/door.png');
        this.load.image('open_door', 'assets/open_door.png');
        this.load.audio('background_music', 'assets/background_music.mp3');
        this.load.audio('bling_sound', 'assets/bling_sound.wav');
        this.load.audio('win_sound', 'assets/win.mp3');
    }

    create() {
        // Music
        this.music = this.sound.add('background_music', { loop: true, volume: 0.5 });
        this.music.play();

        // Background 
        this.add.image(400, 300, 'background').setDisplaySize(800, 600);

        // Layout
        this.maze = [
            "####################",
            "# P              E #",
            "# ### ### ###### ###",
            "# # C           #   #",
            "# # ### ##  #####   #",
            "#     #             #",
            "# ### ### ###### ###",
            "#    C          #   #",
            "# # ### #########   #",
            "#     #     C        #",
            "# ### ### ###### ###",
            "# #           #    #",
            "# # ### ######   ####",
            "#    #          D  #",
            "####################",
        ];

        this.cellSize = 40;
        this.walls = this.physics.add.staticGroup();
        this.collectibles = this.physics.add.group();

        // Make maze
        for (let row = 0; row < this.maze.length; row++) {
            for (let col = 0; col < this.maze[row].length; col++) {
                let x = col * this.cellSize + this.cellSize/2;
                let y = row * this.cellSize + this.cellSize/2;
                let cell = this.maze[row][col];

            if (cell === '#') {
                let wall = this.add.rectangle(x, y, this.cellSize, this.cellSize, 0x2900A2)
                    .setStrokeStyle(2, 0x000000);  // 2px black outline

                this.physics.add.existing(wall, true);  // static body
                this.walls.add(wall);
            }
            else if (cell === 'P') {
                this.player = this.physics.add.sprite(x, y, 'player').setDisplaySize(this.cellSize, this.cellSize);
            }
            else if (cell === 'E') {
                this.enemy = this.physics.add.sprite(x, y, 'eye').setDisplaySize(this.cellSize, this.cellSize);
            }
            else if (cell === 'C') {
                let coin = this.add.circle(x, y, 5, 0xE0FF00);  // radius 5
                this.physics.add.existing(coin);  // dynamic body
                this.collectibles.add(coin);
            }
            else if (cell === 'D') {
                this.door = this.physics.add.sprite(x, y, 'door').setDisplaySize(this.cellSize, this.cellSize);
                this.doorOpen = false;
            }
        }
    }


        // Input
        this.cursors = this.input.keyboard.createCursorKeys();

        // Collisions
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.overlap(this.player, this.collectibles, this.collectCollectible, null, this);
        this.physics.add.overlap(this.player, this.door, this.tryDoor, null, this);
        this.physics.add.overlap(this.player, this.enemy, this.loseLevel, null, this);

        // Enemy logic
        this.enemySpeed = 60; 
    }

    update(time, delta) {
        // Player 
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-200);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(200);
        }

        // Enemy Logic
        this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);

        // SUCCESS
        if (this.doorOpen) {
            this.door.setTexture('open_door');
        }
    }

    collectCollectible(player, collectible) {
        collectible.destroy();
        this.sound.play('bling_sound', { volume: 0.3 });

        if (this.collectibles.countActive() === 0) {
            this.doorOpen = true;
            this.sound.play('win_sound', { volume: 0.4 });
        }
    }

    tryDoor(player, door) {
        if (this.doorOpen) {
            this.music.stop();
            this.add.text(250, 300, 'TRUTH DEFEATED', { fontSize: '32px', fill: '#fff' });
            this.time.delayedCall(3000, () => {
                this.scene.start('LevelSelect');
            });
        }
    }

    loseLevel() {
        this.music.stop();
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        this.add.text(150, 300, 'YOU ARE TO BLAME. TRY AGAIN', { fontSize: '32px', fill: '#fff' });
        this.time.delayedCall(5000, () => {
            this.scene.start('LevelSelect');
        });
    }
}


// Level 2 
class Level2 extends Phaser.Scene {
    constructor() { super('Level2'); }

    preload() {
        // Loading stuff
        this.load.image('player2', 'assets/2.png');
        this.load.image('eye', 'assets/eye.png');
        this.load.image('chest2', 'assets/chest2.png');
        this.load.audio('win_sound', 'assets/win.mp3');
    }

    create() {
        //  MORE LOADING
        this.cameras.main.setBackgroundColor('#000000');

        this.player = this.physics.add.sprite(100, 300, 'player2').setScale(0.5);
        this.player.health = 100;
        this.player.speed = 200;
        this.player.attack = false;

        this.enemy = this.physics.add.sprite(600, 300, 'eye').setScale(0.5);
        this.enemy.health = 100;
        this.enemy.speed = 150;
        this.enemy.attack = false;

        // Health bars
        this.graphics = this.add.graphics();

        // Input 
        this.cursors = this.input.keyboard.addKeys({
            left: 'A',
            right: 'D',
            up: 'W',
            down: 'S',
            attack: 'SPACE'
        });

        // Sound
        this.winSound = this.sound.add('win_sound', { volume: 0.4 });

        // Enemy delays
        this.enemyDelayCounter = 0;
    }

    update(time, delta) {
        // Player logic
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-this.player.speed);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(this.player.speed);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-this.player.speed);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(this.player.speed);
        }

        this.player.attack = this.cursors.attack.isDown;

        // Enemy logic
        this.enemyDelayCounter += delta;
        if (this.enemyDelayCounter >= 500) { // every ~500 ms
            this.physics.moveToObject(this.enemy, this.player, this.enemy.speed);
            this.enemyDelayCounter = 0;
        }

        this.enemy.attack = Phaser.Math.Between(0, 1) === 1;

        // ATTACK
        if (this.player.attack && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.enemy.x, this.enemy.y) < 50) {
            this.enemy.health -= 0.5;
        }

        if (this.enemy.attack && Phaser.Math.Distance.Between(this.enemy.x, this.enemy.y, this.player.x, this.player.y) < 50) {
            this.player.health -= 0.3;
        }

        // Health
        this.drawHealthBars();

        // Success??
        if (this.player.health <= 0) {
            this.loseLevel();
        }
        if (this.enemy.health <= 0) {
            this.winLevel();
        }
    }

    drawHealthBars() {
        this.graphics.clear();

        // Player 
        this.graphics.fillStyle(0xff0000);
        this.graphics.fillRect(this.player.x - 50, this.player.y - 60, 100, 10);
        this.graphics.fillStyle(0x00ff00);
        this.graphics.fillRect(this.player.x - 50, this.player.y - 60, this.player.health, 10);

        // Enemy
        this.graphics.fillStyle(0xff0000);
        this.graphics.fillRect(this.enemy.x - 50, this.enemy.y - 60, 100, 10);
        this.graphics.fillStyle(0x00ff00);
        this.graphics.fillRect(this.enemy.x - 50, this.enemy.y - 60, this.enemy.health, 10);
    }

    loseLevel() {
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        this.add.text(150, 300, 'YOU ARE TO BLAME. TRY AGAIN', { fontSize: '32px', fill: '#fff' });
        this.time.delayedCall(5000, () => {
            this.scene.start('LevelSelect');
        });
    }

    winLevel() {
        this.winSound.play();
        this.add.image(400, 300, 'chest2');
        this.add.text(300, 300, 'Anger Defeated', { fontSize: '32px', fill: '#000' });
        this.time.delayedCall(3000, () => {
            this.scene.start('LevelSelect');
        });
    }
}


// Level 3 
class Level3 extends Phaser.Scene {
    constructor() { super('Level3'); }

    preload() {
        // Loading...
        this.load.image('player', 'assets/player.png');
        this.load.image('key', 'assets/key.png');
        this.load.image('chest3', 'assets/chest3.png');
        this.load.audio('win_sound', 'assets/win.mp3');
    }

    create() {
        // Background
        this.cameras.main.setBackgroundColor('#ffffff');

        // Player
        this.player = this.physics.add.sprite(300, 350, 'player').setDisplaySize(50, 50);
        this.player.setCollideWorldBounds(true);
        this.player.speed = 300;

        // FOs
        this.fallingObjects = this.physics.add.group();

        // Spawning
        for (let i = 0; i < 5; i++) {
            this.spawnFallingObject(false);
        }

        this.keyObject = this.spawnFallingObject(true);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.AKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.DKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        // SUCCESS??
        this.winSound = this.sound.add('win_sound', { volume: 0.4 });

        this.keySecured = false;
    }

    update() {
        // Movement
        this.player.setVelocityX(0);

        if (this.cursors.left.isDown || this.AKey.isDown) {
            this.player.setVelocityX(-this.player.speed);
        } else if (this.cursors.right.isDown || this.DKey.isDown) {
            this.player.setVelocityX(this.player.speed);
        }

        // Update objects
        this.fallingObjects.getChildren().forEach(obj => {
            obj.y += obj.speed;
            if (obj.y > 400) { // reset to top if falls past screen
                obj.x = Phaser.Math.Between(0, 600 - 30);
                obj.y = Phaser.Math.Between(-50, -30);
            }
        });

        // Colliding
        this.physics.world.overlap(this.player, this.fallingObjects, this.handleCollision, null, this);
    }

    spawnFallingObject(isKey) {
        let x = Phaser.Math.Between(0, 600 - 30);
        let y = Phaser.Math.Between(-50, -30);

        let obj;
        if (isKey) {
            obj = this.physics.add.sprite(x, y, 'key').setDisplaySize(30, 30);
        } else {
            obj = this.physics.add.sprite(x, y, null).setDisplaySize(30, 30);
            obj.setTint(0x0000ff); // blue block
        }

        obj.speed = Phaser.Math.Between(3, 6);
        obj.isKey = isKey;

        this.fallingObjects.add(obj);

        return obj;
    }

    handleCollision(player, obj) {
        if (obj.isKey && !this.keySecured) {
            this.keySecured = true;
            this.winSound.play();

            this.add.image(300, 200, 'chest3');
            this.add.text(200, 200, 'Bargaining Defeated', { fontSize: '32px', fill: '#0000ff' });

            this.time.delayedCall(3000, () => {
                this.scene.start('LevelSelect');
            });
        } else if (!obj.isKey) {
            this.loseLevel();
        }
    }

    loseLevel() {
        this.add.rectangle(300, 200, 600, 400, 0x000000, 0.8);
        this.add.text(100, 200, 'YOU ARE TO BLAME. TRY AGAIN', { fontSize: '32px', fill: '#fff' });

        this.time.delayedCall(5000, () => {
            this.scene.start('LevelSelect');
        });
    }
}


// Level 4 
class Level4 extends Phaser.Scene {
    constructor() { super('Level4'); }

    preload() {
        // Load assets
        this.load.image('player', 'assets/player.png');
        this.load.image('platform', 'assets/platform.png');
        this.load.image('ground', 'assets/ground.png');
        this.load.image('chest4', 'assets/chest4.png');
        this.load.audio('win_sound', 'assets/win.mp3');
    }

    create() {
        // --- Enable gravity ---
        this.physics.world.gravity.y = 600;

        // --- Background ---
        this.ground = this.add.tileSprite(400, 550, 800, 100, 'ground');

        // --- Player ---
        this.player = this.physics.add.sprite(100, 400, 'player').setDisplaySize(50, 50);
        this.player.setCollideWorldBounds(false);
        this.player.jumpVelocity = -400;
        this.player.isJumping = false;

        // --- Platforms ---
        this.platforms = this.physics.add.group({ immovable: true, allowGravity: false });

        // Spawn initial platforms
        for (let i = 0; i < 5; i++) {
            this.spawnPlatform(800 + i * 200);
        }

        // --- Collisions ---
        this.physics.add.collider(this.player, this.platforms, () => {
            this.player.isJumping = false;
        });

        // --- Input ---
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // --- Sound ---
        this.winSound = this.sound.add('win_sound', { volume: 0.4 });

        // --- Score ---
        this.score = 0;
        this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '24px', fill: '#fff' });

        // --- Flags ---
        this.gameOver = false;
    }

    update() {
        if (this.gameOver) return;

        // --- Player jump ---
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.player.isJumping) {
            this.player.setVelocityY(this.player.jumpVelocity);
            this.player.isJumping = true;
        }

        // --- Move platforms left ---
        this.platforms.getChildren().forEach(platform => {
            platform.x -= 3;

            // Recycle platform if off screen
            if (platform.x < -platform.width / 2) {
                platform.x = 800 + Phaser.Math.Between(0, 100);
                platform.y = Phaser.Math.Between(300, 500);

                // Increment score
                this.score += 1;
                this.scoreText.setText('Score: ' + this.score);
            }
        });

        // --- Move background (parallax) ---
        this.ground.tilePositionX += 2;

        // --- Check win ---
        if (this.score >= 15) {
            this.winLevel();
        }

        // --- Check lose ---
        if (this.player.y > 600) {
            this.loseLevel();
        }
    }

    spawnPlatform(xPos) {
        let y = Phaser.Math.Between(300, 500);
        let platform = this.platforms.create(xPos, y, 'platform');
        platform.setDisplaySize(150, 30);
        platform.body.setVelocityX(0); // static platform
    }

    winLevel() {
        this.gameOver = true;
        this.winSound.play();

        this.add.image(400, 300, 'chest4');
        this.add.text(250, 300, 'Depression Defeated', { fontSize: '32px', fill: '#000' });

        this.time.delayedCall(3000, () => {
            this.scene.start('LevelSelect');
        });
    }

    loseLevel() {
        this.gameOver = true;

        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        this.add.text(150, 300, 'YOU ARE TO BLAME. TRY AGAIN', { fontSize: '32px', fill: '#fff' });

        this.time.delayedCall(5000, () => {
            this.scene.start('LevelSelect');
        });
    }
}


// Level 5 
class Level5 extends Phaser.Scene {
    constructor() { super('Level5'); }

    preload() {
        // loading
        for (let i = 1; i <= 6; i++) {
            this.load.image('image' + i, 'assets/image' + i + '.png');
        }
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        // CUTSCENCES
        this.images = [];
        for (let i = 1; i <= 6; i++) {
            let img = this.add.image(400, 300, 'image' + i);
            img.setVisible(false);
            this.images.push(img);
        }

        this.currentImageIndex = 0;
        this.imageDisplayTime = 5000; 

        this.images[0].setVisible(true);

        this.time.addEvent({
            delay: this.imageDisplayTime,
            callback: this.showNextImage,
            callbackScope: this,
            loop: true
        });
    }

    showNextImage() {
        // Hide current
        this.images[this.currentImageIndex].setVisible(false);

        // Advance 
        this.currentImageIndex++;

        // Bruhbruhbruh
        if (this.currentImageIndex >= this.images.length) {
            this.showFinalText();
        } else {
            this.images[this.currentImageIndex].setVisible(true);
        }
    }

    showFinalText() {
        // Clear images
        this.images.forEach(img => img.setVisible(false));

        this.add.text(400, 250, 'Grief is difficult.', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 320, 'Thank you for playing', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

        // END LEVEL
        this.time.delayedCall(3000, () => {
            this.scene.start('LevelSelect');
        });
    }
}


// Phaser Config
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },  // Will enable y gravity for Level 4
            debug: false
        }
    },
    scene: [MainMenu, LevelSelect, Level1, Level2, Level3, Level4, Level5]
};

// START
var game = new Phaser.Game(config);
