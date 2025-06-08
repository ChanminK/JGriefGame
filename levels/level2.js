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
