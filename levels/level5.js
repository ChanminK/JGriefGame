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
