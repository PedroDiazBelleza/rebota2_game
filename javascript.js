document.getElementById('startGame').addEventListener('click', () => {
    player1Name = document.getElementById('player1Name').value || 'Jugador 1';
    player2Name = document.getElementById('player2Name').value || 'Jugador 2';
    normalSpeed = document.getElementById('normalSpeed').checked;
    fastSpeed = document.getElementById('fastSpeed').checked;
    termsAccepted = document.getElementById('termsCheck').checked;
    velocidad = normalSpeed ? 500 : 1000; 

    console.log('Nombre Jugador 1:', player1Name);
    console.log('Nombre Jugador 2:', player2Name);
    console.log('Velocidad Normal:', normalSpeed);
    console.log('Velocidad Rapida:', fastSpeed);
    if (!termsAccepted) {
        alert('Debes aceptar las condiciones para jugar.');
        return;
    }
 
    document.getElementById('formularioJuego').style.display = 'none';

    iniciarJuego();  
});


function iniciarJuego() {
    new Phaser.Game(config);
}

class Escena extends Phaser.Scene {   

    
    preload() {
        this.load.image('fondo', 'img/fondo.jpg');
        this.load.spritesheet('bola', 'img/bola.png', {
            frameWidth: 100,
            frameHeight: 100
        });
        this.load.image('mano1', 'img/mano1.png');
        this.load.image('mano2', 'img/mano2.png');
        this.load.image('leftbtn', 'img/flecha.png');

        this.load.audio('musicaFondo', 'audio/music.mp3');
    }

    create() {

        this.music = this.sound.add('musicaFondo'); // Cargar la música
        this.music.setLoop(true);  // Reproducir en bucle
        this.music.play();  // Reproducir la música
        this.music.setVolume(0.5);

        // Agregar punteros
        this.input.addPointer();
        this.input.addPointer();
        this.input.addPointer();

        // Fondo y bola
        this.add.sprite(480, 320, 'fondo').setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        this.bola = this.physics.add.sprite(480, 320, 'bola')

        this.anims.create({
            key: 'brillar',
            frames: this.anims.generateFrameNumbers('bola', {
                start: 0,
                end: 3
            }),
            frameRate: 10,
            repeat: -1
        });
        this.bola.play('brillar');

        this.bola.setBounce(1);
        this.mano1 = this.physics.add.sprite(70, 320, 'mano1');
        this.mano1.body.immovable = true;
        this.bola.setBounce(10);
        this.mano1.setSize(60, 250);
        this.physics.add.collider(this.bola, this.mano1);
        this.mano1.setCollideWorldBounds(true);

        // mano2
        this.mano2 = this.physics.add.sprite(882, 320, 'mano2');
        this.mano2.body.immovable = true;
        this.bola.setBounce(10);
        this.mano2 = this.mano2.setSize(60, 250);
        this.physics.add.collider(this.bola, this.mano2);
        this.mano2.setCollideWorldBounds(true);

        // Dirección de la bola
        let anguloInicial = Math.random() * Math.PI / 2 + Math.PI / 4;
        const derechoOIzq = Math.floor(Math.random() * 2);
        if (derechoOIzq === 1) anguloInicial = anguloInicial + Math.PI;

        const vx = Math.sin(anguloInicial) * velocidad;
        const vy = Math.cos(anguloInicial) * velocidad;

        this.bola.setBounce(1);
        this.bola.setCollideWorldBounds(true);
        this.physics.world.setBoundsCollision(false, false, true, true);

        this.bola.body.velocity.x = vx;
        this.bola.body.velocity.y = vy;

        // Controles
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

        // Controles visuales
        this.controlesVisuales({
            x: 50,
            y: 50
        }, {
            x: 50,
            y: 590
        }, this.mano1);

        this.controlesVisuales({
            x: 910,
            y: 50
        }, {
            x: 910,
            y: 590
        }, this.mano2);

        this.alguienGano = false;

        this.pintarMarcador();

        this.winText = this.add.text(480, 320, '', {
            fontFamily: 'Orbitron', // Fuente estilo retro-futurista
            fontSize: '60px',
            color: '#00fff7', // Azul neón
            align: 'center',
            backgroundColor: '#1a1a2e', // Fondo oscuro
            stroke: '#ff007f', // Borde fucsia
            strokeThickness: 6,
            shadow: {
                offsetX: 4,
                offsetY: 4,
                color: '#00ffea',
                blur: 8,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5).setVisible(false);
        
    }

    update() {
        this.bola.rotation += 0.1;

        if (this.bola.x < 0 && this.alguienGano === false) {

            if (this.marcadorMano2.text === '5') {
                this.marcadorMano2.text = '0';
                this.marcadorMano1.text = '0';

                this.music.stop(); // Detener la música
                this.winText.setText('¡El jugador ' + player2Name + ' ha ganado!').setVisible(true); // Mostrar mensaje retro
                this.time.delayedCall(3000, () => {
                    this.winText.setVisible(false); // Ocultar el mensaje retro
                    this.scene.restart(); // Reiniciar la escena
                });
            }
            this.alguienGano = true;
            this.marcadorMano2.text = parseInt(this.marcadorMano2.text) + 1;
            this.colocarPelota();
        } else if (this.bola.x > 960 && this.alguienGano === false) {

            if (this.marcadorMano1.text === '5') {
                this.marcadorMano1.text = '0';
                this.marcadorMano2.text = '0';

                this.music.stop(); // Detener la música
                this.winText.setText('¡El jugador ' + player1Name + ' ha ganado!').setVisible(true); // Mostrar mensaje retro
                this.time.delayedCall(3000, () => {
                    this.winText.setVisible(false); // Ocultar el mensaje retro
                    this.scene.restart(); // Reiniciar la escena
                });
            }
            this.alguienGano = true;
            this.marcadorMano1.text = parseInt(this.marcadorMano1.text) + 1;
            this.colocarPelota();
        }

        // Movimiento para mano1 (usando las teclas de flecha y W/S)
        if (this.keyW.isDown || this.mano1.getData('direccionVertical') === 1) {
            this.mano1.y = this.mano1.y - 5;
        } else if (this.keyS.isDown || this.mano1.getData('direccionVertical') === -1) {
            this.mano1.y = this.mano1.y + 5;
        }

        // Movimiento para mano2 (usando las teclas de flecha y W/S)
        if (this.cursors.up.isDown || this.mano2.getData('direccionVertical') === 1) {
            this.mano2.y = this.mano2.y - 5;
        } else if (this.cursors.down.isDown || this.mano2.getData('direccionVertical') === -1) {
            this.mano2.y = this.mano2.y + 5;
        }
    }

    pintarMarcador() {
        const estiloMarcador = {
            fontFamily: 'Orbitron', // o 'Press Start 2P', según prefieras
            fontSize: '80px',
            color: '#00fff7', // Azul neón
            align: 'right',
            stroke: '#ff00ff', // Borde rosa brillante
            strokeThickness: 6,
            shadow: {
                offsetX: 4,
                offsetY: 4,
                color: '#00ffcc',
                blur: 10,
                stroke: true,
                fill: true
            }
        };
    
        this.marcadorMano1 = this.add.text(440, 75, '0', estiloMarcador).setOrigin(1, 0);
        this.marcadorMano2 = this.add.text(520, 75, '0', estiloMarcador).setOrigin(0, 0);
    }
    

    colocarPelota() {
        let anguloInicial = Math.random() * Math.PI / 2 + Math.PI / 4;
        const derechoOIzq = Math.floor(Math.random() * 2);
        if (derechoOIzq === 1) anguloInicial = anguloInicial + Math.PI;

        const vx = Math.sin(anguloInicial) * velocidad;
        const vy = Math.cos(anguloInicial) * velocidad;

        this.bola = this.physics.add.sprite(480, 320, 'bola');
        this.bola.play('brillar');

        this.bola.setBounce(1);
        this.physics.world.enable(this.bola);

        this.bola.setCollideWorldBounds(true);
        this.physics.world.setBoundsCollision(false, false, true, true);

        this.bola.body.velocity.x = vx;
        this.bola.body.velocity.y = vy;
        this.physics.add.collider(this.bola, this.mano1);
        this.physics.add.collider(this.bola, this.mano2);
        this.alguienGano = false;
    }

    controlesVisuales(btn1, btn2, player) {
        player.setData('direccionVertical', 0);
        const upbtn = this.add.sprite(btn1.x, btn1.y, 'leftbtn').setInteractive().setDisplaySize(70,70);
        const downbtn = this.add.sprite(btn2.x, btn2.y, 'leftbtn').setInteractive().setDisplaySize(70,70);
        downbtn.flipY = true;

        downbtn.on('pointerdown', () => {
            player.setData('direccionVertical', -1);
        });

        upbtn.on('pointerdown', () => {
            player.setData('direccionVertical', 1);
        });

        downbtn.on('pointerup', () => {
            player.setData('direccionVertical', 0);
        });

        upbtn.on('pointerup', () => {
            player.setData('direccionVertical', 0);
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 640,  // Corregido aquí
    scene: Escena,
    physics: {
        default: 'arcade',
    },
};

