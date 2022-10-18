class Card extends Phaser.GameObjects.Sprite {  // расширяем класс Sprite внутри Phaser классом Card
    constructor(scene, value) {
        super(scene, 0, 0, 'card');
        this.scene = scene;
        this.value = value;
        this.scene.add.existing(this); // чтобы добавить спрайт на экран
        this.setInteractive();
        this.opened = false;  // параметр что карты не открыта по умолчанию
    }

    init(position) {
        this.position = position;
        this.close();
        this.setPosition(-this.width, -this.height);
    }

    move(params) {  // полет карты
        this.scene.tweens.add({  
            targets: this, 
            x: params.x,
            y: params.y,
            delay: params.delay,
            ease: 'Linear',
            duration: 250,
            onComplete: () => {
                if (params.callback) {
                    params.callback();
                }
            }
        });
    }

    flip(callback) {
        this.scene.tweens.add({  // анимация переворота карты
            targets: this, // обьект для анимации
            scaleX: 0,  // сжатие карты по оси
            ease: 'Linear',  // тип анимации линейный
            duration: 150,  // время анимации
            onComplete: () => {
                this.show(callback);
            }
        });
    }

    show(callback) {
        let texture = this.opened ? 'card' + this.value : 'card';
        this.setTexture(texture);
        this.scene.tweens.add({
            targets: this,
            scaleX: 1,
            ease: 'Linear',
            duration: 150,
            onComplete: () => {
                if (callback) {
                    callback();
                }
            }
        });
    }

    open(callback) {
        this.opened = true;
        this.flip(callback);
    }
    close() {
        if (this.opened) {
            this.opened = false;
            this.flip();
        }
    }
}