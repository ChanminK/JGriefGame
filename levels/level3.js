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
