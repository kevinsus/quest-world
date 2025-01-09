<template>
  <div id="phaser-container"></div>
</template>

<script>
import Phaser from 'phaser';

export default {
  name: 'Level2',
  mounted() 
  {
    const config = {
        type: Phaser.AUTO,
        parent: 'phaser-container',
        width: 800,
        height: 600,
        backgroundColor: '#026bc6',
        pixelArt: true,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 800 },
                debug: false,
            },
        },
        scene: {
            preload,
            create,
            update,
        }
    };

    this.game = new Phaser.Game(config)
    
    let player
    let platforms

    function preload() {
        this.load.atlas('knight', '/assets/knight.png', '/assets/knight.json');
        this.load.image('bg', '/assets/clouds.png');
        this.load.spritesheet('tiles', '/assets/fantasy-tiles.png', { frameWidth: 64, frameHeight: 64 });
    }

    function create() {
        // Background        
        this.add.image(400, 48, 'bg').setOrigin(0.5, 0);
        platforms = this.physics.add.staticGroup()   // add static groups for platforms
        for (let i = 0; i < 13; i++) platforms.create(64 * i, 570, 'tiles')

        // Animation
        player = this.physics.add.sprite(100, 450, 'knight').setOrigin(0.5, 1).setScale(3)
        // player.body.setOffset(0, -12);
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);

        this.anims.create({ 
            key: 'idle',
            frames: this.anims.generateFrameNames("knight", { prefix: "idle/frame", start: 0, end: 5, zeroPad: 4 }),
            frameRate: 8,
            repeat: -1,
        })
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNames('knight', { prefix: "run/frame", start: 0, end: 7, zeroPad: 4 }),
            frameRate: 12,
            repeat: -1,
        })

        this.physics.add.collider(player, platforms)
        player.play('idle')

        // Input keys
        this.cursors = this.input.keyboard.createCursorKeys();

    }
    function update() {
        if (this.cursors.left.isDown) {
            player.setFlipX(true)
            player.setVelocityX(-160);
            player.play('run', true)
        } else if (this.cursors.right.isDown) {
            player.setFlipX(false)
            player.setVelocityX(160)
            player.play('run', true)
        } else {
            player.setVelocityX(0);
            player.play('idle', true)
        }
    }

  },
};
</script>

