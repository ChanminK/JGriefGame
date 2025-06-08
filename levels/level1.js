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
        this.add.image(400, 300, 'background');

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
                    this.walls.create(x, y, null).setOrigin(0.5).setDisplaySize(this.cellSize, this.cellSize).refreshBody().setFillStyle(0x2900A2);
                }
                else if (cell === 'P') {
                    this.player = this.physics.add.sprite(x, y, 'player').setDisplaySize(this.cellSize, this.cellSize);
                }
                else if (cell === 'E') {
                    this.enemy = this.physics.add.sprite(x, y, 'eye').setDisplaySize(this.cellSize, this.cellSize);
                }
                else if (cell === 'C') {
                    let collectible = this.physics.add.sprite(x, y, null).setOrigin(0.5).setDisplaySize(10, 10);
                    collectible.setTint(0xE0FF00);
                    this.collectibles.add(collectible);
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
