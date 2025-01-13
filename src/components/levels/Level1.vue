<template>
    <div id="game-container">
        <div id="phaser-example">
            <button @click="back" class="bg-white">Back</button>
        </div>
        <div id="editor"></div>
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
#editor {
  border: 1px solid #ccc;
  height: 100%;
  width: 100%;
  font-family: "Courier New", Courier, monospace;
  font-size: 14px;
  background-color: aliceblue;
}
</style>

<script>
import { useRouter } from "vue-router"
import Phaser from 'phaser';
import { EditorView, basicSetup } from "codemirror"
import { python } from "@codemirror/lang-python"


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
                    debug: true,
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
        let trap_platform
        let ladder_platform
        let pass_platform
        let player_stats = 'right'

        function preload() {
            this.load.atlas('knight', '/assets/knight.png', '/assets/knight.json');
            this.load.image('bg', '/assets/clouds.png');
            this.load.spritesheet('tiles', '/assets/fantasy-tiles.png', { frameWidth: 64, frameHeight: 64 });
        }

        function create() {
            
        // Background        
        this.add.image(500, 48, 'bg').setOrigin(0.5, 0).setScale(1.5);
        platforms = this.physics.add.staticGroup()   // add static groups for platforms
        trap_platform = this.physics.add.staticGroup()
        ladder_platform = this.physics.add.staticGroup()
        pass_platform = this.physics.add.staticGroup()
        for (let i = 4; i < 7; i++) trap_platform.create(64 * i, 670, 'tiles', 35) // spike traps
        for (let i = 8; i < 10; i++) trap_platform.create(64 * i, 670, 'tiles', 35) // spike traps
        for (let i = 4; i < 7; i++) platforms.create(64 * i, 350, 'tiles', 28) // box ground
        for (let i = 8; i < 12; i++) platforms.create(64 * i, 510, 'tiles', 28) // box ground
        for (let i = 9; i < 11; i++) platforms.create(64 * i, 255, 'tiles', 28) // box ground
        for (let i = 0; i < 5; i++) ladder_platform.create(64 * 3, 350 + i * 64, 'tiles', 56) // ladder
        for (let i = 0; i < 4; i++) ladder_platform.create(64 * 11, 255 + i * 64, 'tiles', 56) // ladder
        for (let i = 0; i < 3; i++) ladder_platform.create(64 * 7, 510 + i * 64, 'tiles', 56) // ladder
        for (let i = 0; i < 7; i++) platforms.create(64 * 13, 0 + i * 64, 'tiles', 27) // Wall
        for (let i = 0; i < 4; i++) platforms.create(64 * i, 670, 'tiles') // ground
        for (let i = 7; i < 8; i++) platforms.create(64 * i, 670, 'tiles') // ground
        for (let i = 10; i < 17; i++) platforms.create(64 * i, 670, 'tiles') // ground
        for (let i = 7; i < 8; i++) pass_platform.create(64 * i, 610, 'tiles', 42) // coins
        for (let i = 9; i < 10; i++) pass_platform.create(64 * i, 190, 'tiles', 42) // coins
        for (let i = 15; i < 16; i++) platforms.create(64 * i, 610, 'tiles', 57) // chest
        
        // Animation
            player = this.physics.add.sprite(100, 450, 'knight').setScale(3);
            player.body.setSize(player.width * 0.27, player.height * 0.8)
            player.body.setOffset(player.width * 0.24, player.height * 0.2)

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
                frames: this.anims.generateFrameNames('knight', { prefix: "run/frame", start: 0, end: 1, zeroPad: 4 }),
                frameRate: 8,
                repeat: -1,
            })
            this.anims.create({
                key: 'die',
                frames: this.anims.generateFrameNames('knight', { prefix: "die/frame", start: 0, end: 9, zeroPad: 4 }),
                frameRate: 12,
                repeat: 0,
            })
            this.anims.create({
                key: 'attack',
                frames: this.anims.generateFrameNames('knight', { prefix: 'attack_C/frame', start: 0, end: 13, zeroPad: 4} ),
                frameRate: 16,
                repeat: -1,
            })

            // Coins Animations
            this.anims.create({
                key: 'attack',
                frames: this.anims.generateFrameNames( 'coins', { start: 42, end: 47 }),
                frameRate: 12,
                repeat: -1
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
            if (player.anims.getName() !== 'die') {

                // run and idle animation
                if (player.anims.getName() !== 'jump') {
                    if (this.cursors.left.isDown) {
                        if (player_stats === 'right') {
                            player.setPosition(player.x - 55, player.y)
                            player_stats = 'left'
                        }
                        player.body.setOffset(player.width * 0.5, player.height * 0.2)
                        player.setFlipX(true)
                        player.setVelocityX(-160);
                        player.play('run', true)
                        // console.log("run")
                    } else if (this.cursors.right.isDown) {
                        if (player_stats === 'left') {
                            player.setPosition(player.x + 55, player.y)
                            player_stats = 'right'
                        }
                        player.body.setOffset(player.width * 0.24, player.height * 0.2)
                        player.setFlipX(false) 
                        player.setVelocityX(160)
                        player.play('run', true)
                        // console.log("run")
                    } else {
                        player.setVelocityX(0);
                        player.play('idle', true)
                        // console.log("idle")
                    }
                }
                
                // Jumping animation
                if (this.cursors.up.isDown && player.body.touching.down) {
                    player.setVelocityY(-330);
                    player.play('jump', true)
                    // console.log("jump")
                }
                // Fall animation
                if (!player.body.touching.down && player.body.velocity.y > 0) {
                    player.play('fall', true);
                    // console.log("fall_lol")
                }

                // Die animation
                if (this.physics.overlap(player, trap_platform)) {
                    player.play('die', true)
                    // console.log("die")
                    this.time.delayedCall(500, () => {
                        player.setVelocity(0)
                    });
                    this.time.delayedCall(3000, () => {
                        this.scene.restart();
                    });
                }
                
                // Up Ladder Animation
                if (this.physics.overlap(player, ladder_platform)) {
                    if (this.cursors.up.isDown) {
                        player.setVelocityY(-330);
                        player.play('jump', true)
                        player.body.setAllowGravity(true)
                    } else if (this.cursors.down.isDown) {
                        player.setVelocityY(330)
                        player.play('fall', true)
                        player.body.setAllowGravity(true)
                    } else {
                        player.setVelocityY(0)
                        player.body.setAllowGravity(false)
                    }
                } 
            }
        }


        // CODE MIRROR
        let view = new EditorView({
            extensions: [
                basicSetup, 
                python(),
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) { 
                        // console.log(view.state.doc.toString())
                    }
                })
            ],
            parent: document.getElementById('editor')
        })
    },
};
</script>

