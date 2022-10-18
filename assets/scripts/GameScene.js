class GameScene extends Phaser.Scene {
    constructor() {
        super("Game");
    }
    preload() {
        this.load.image('bg', 'assets/sprites/background.png');
        this.load.image('card', 'assets/sprites/card.png');
        this.load.image('card1', 'assets/sprites/card1.png');
        this.load.image('card2', 'assets/sprites/card2.png');
        this.load.image('card3', 'assets/sprites/card3.png');
        this.load.image('card4', 'assets/sprites/card4.png');
        this.load.image('card5', 'assets/sprites/card5.png');

        this.load.audio('card', 'assets/sounds/card.mp3');
        this.load.audio('complete', 'assets/sounds/complete.mp3');
        this.load.audio('success', 'assets/sounds/success.mp3');
        this.load.audio('theme', 'assets/sounds/theme.mp3');
        this.load.audio('timeout', 'assets/sounds/timeout.mp3');
    }
    createText() {
        this.timeoutText = this.add.text(10, 330, "", {
            font: '36px CurseCasual',
            fill: '#ffffff'
        });
    }
    onTimerTick() {
        this.timeoutText.setText("Time: " + this.timeout);

        if (this.timeout <= 0) {
            this.timer.paused = true;
            this.sounds.timeout.play();
            this.restart();
        } else {
            --this.timeout;
        }
    }
    createTimer() {
        this.timer = this.time.addEvent({
            delay: 1000,
            callback: this.onTimerTick, // какая ф-я запущена при выполнении
            callbackScope: this,
            loop: true
        });
    }
    createSounds() {
        this.sounds = {
            card: this.sound.add('card'),
            complete: this.sound.add('complete'),
            success: this.sound.add('success'),
            theme: this.sound.add('theme'),
            timeout: this.sound.add('timeout'),
        };
        this.sounds.theme.play({volume: 0.1});
    }
    create() {
        this.timeout = config.timeout;
        this.createSounds();
        this.createTimer();
        this.createBackground();
        this.createText();
        this.createCards();
        this.start();
    }
    restart() {
        let count = 0;
        let onCardMoveComplete = () => {
            ++count;
            if (count >= this.cards.length) {
                this.start();
            }
        };
        this.cards.forEach(card => {
            // card.depth = 1/card.position.delay/100;
            card.move({
                x: this.sys.game.config.width + card.width,
                y: this.sys.game.config.height + card.height,
                delay: card.position.delay,
                callback: onCardMoveComplete
            });
        });
    }
    start() {
        this.initCardsPositions(); 
        this.timeout = config.timeout;
        this.openedCard = null;
        this.openedCardsCount = 0;   // количество открытых карт
        this.timer.paused = false;
        this.initCards();
        this.showCards();
    }
    initCards() {   // перетасовка карт
        let positions = Phaser.Utils.Array.Shuffle(this.positions);

        this.cards.forEach(card => {
            card.init(positions.pop());  // берем последнюю позицию в отсортированом массиве
        });
    }
    showCards() {
        this.cards.forEach(card => {
            card.depth = card.position.delay;
            card.move({
                x: card.position.x,
                y: card.position.y,
                delay: card.position.delay
            });
        });
    }
    createBackground() {
        this.add.sprite(0, 0, 'bg').setOrigin(0, 0);
    }
    createCards() {
        this.cards = [];

        for (let value of config.cards) {
            for (let i = 0; i < 2; i++) {
                this.cards.push(new Card(this, value)); 
            }
        }   

        this.input.on("gameobjectdown", this.onCardClicked, this);  // gameobjectdown - метод вызывается при нажатии, нажатая карта
        //this - обьект игровой сцены
    }
    onCardClicked(pointer, card) {
        if (card.opened) {
            return false;
        }

        this.sounds.card.play();

        if (this.openedCard) {
            // уже есть открытая карта
            if (this.openedCard.value === card.value) { // картинки равны - запомнить
                this.sounds.success.play();
                this.openedCard = null; // две предыдущие отстануться открытыми
                ++this.openedCardsCount;  // увеливаем счетчик открытых карт
            } else {// картинки разные - скрыть прошлую
                this.openedCard.close();
                this.openedCard = card;
            }
        } else { // еще нет открытой карты
            
            this.openedCard = card;
        }

        card.open(() => { // проверка сколько открыто пар карт
            if (this.openedCardsCount === this.cards.length / 2) {  // пары карт для открытия
                this.sounds.complete.play();
                this.restart();
            }
        });
    }
    initCardsPositions() {
        let positions = [];
        let cardTexture = this.textures.get('card').getSourceImage();
        let cardWidth = cardTexture.width + 4;
        let cardHeight = cardTexture.height + 4;
        let offsetX = (this.sys.game.config.width - cardWidth * config.cols) / 2 + cardWidth / 2; // второе деление для правильной анимации
        let offsetY = (this.sys.game.config.height - cardHeight * config.rows) / 2 + cardHeight / 2;

        let id = 0;   //  идентификатор позиции
        for (let row = 0; row < config.rows; row++) {
            for (let col = 0; col < config.cols; col++) {
                ++id;
                positions.push({  // позиция полета карт
                    delay: id * 100,  // вылетают с задержкой каждая
                    x: offsetX + col * cardWidth,
                    y: offsetY + row * cardHeight,
                });
            }
        }

        this.positions = positions;
    }
}
