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
