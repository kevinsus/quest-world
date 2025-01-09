<template>
    <div id="game-container">
        <div id="phaser-example">
            <button @click="back" class="bg-white">Back</button>
        </div>
    </div>
</template>  

<style scoped>
#game-container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 100vh;
    padding-left: 20px;
    background-color: #000;
    margin: 0;
}
canvas {
    display: block;
    margin: auto;
}
</style>

<script>
import { useRouter } from "vue-router"
import Phaser from 'phaser';

export default {
    name: 'Level1',
    setup() {
        const router = useRouter();
        const back = () => {
            router.push('/levels');
        };

        return { back };
    },
    mounted() {
        const config = {
            type: Phaser.AUTO,
            parent: 'phaser-example',
            width: 1000,
            height: 700,
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
            this.add.image(500, 48, 'bg').setOrigin(0.5, 0).setScale(1.5);
            platforms = this.physics.add.staticGroup()   // add static groups for platforms
            for (let i = 0; i < 13; i++) platforms.create(64 * i, 670, 'tiles')

            // Animation
            player = this.physics.add.sprite(100, 450, 'knight').setOrigin(0.5, 1).setScale(3)

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
            this.anims.create({
                key: 'jump',
                frames: this.anims.generateFrameNames('knight', { prefix: "jump_loop/frame", start: 0, end: 1, zeroPad: 4 }),
                frameRate: 8,
                repeat: -1,
            })
            this.anims.create({
                key: 'fall',
                frames: this.anims.generateFrameNames('knight', { prefix: "run/frame", start: 0, end: 0, zeroPad: 4 }),
                frameRate: 8,
                repeat: -1,
            })

            // Player setup
            this.physics.add.collider(player, platforms)
            player.setBounce(0.2);
            player.setCollideWorldBounds(true);
            player.play('idle')

            // Input keys
            this.cursors = this.input.keyboard.createCursorKeys();

        }
        function update() {
            // run and idle animation
            if (player.anims.getName() !== 'jump') {
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

            // Jumping animation
            if (this.cursors.up.isDown && player.body.touching.down) {
                player.setVelocityY(-330);
                player.play('jump', true)
            }
            // Fall animation
            if (!player.body.touching.down && player.body.velocity.y > 0) {
                player.play('fall', true);
            }
        }
    },
};
</script>

