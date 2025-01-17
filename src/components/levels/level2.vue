<template>
    <div id="glass-container" class="bg-[url('/assets/game_bg.jpg')] bg-[length:200px] bg-repeat flex h-screen p-2">
        <div id="phaser-example" >
            <button @click="back" class="rounded rounded-xl bg-[url('/assets/instructions_bg.jpg')] p-2 px-10 text-white m-2">Map</button>
        </div>
        <div class="w-full h-full m-5 space-y-1" >
            <div id="editor" class="h-[70%] bg-[url('/assets/code_bg.webp')] rounded rounded-xl border border-white p-5 relative" >
                <button class="absolute bg-[url('/assets/instructions_bg.jpg')] text-white bottom-0 left-0 right-0 p-2 rounded rounded-xl m-3" @click="runCode" >RUN</button>
            </div>
            <div id="instruction" class="h-[24%] text-white bg-[url('/assets/instructions_bg.jpg')] rounded rounded-xl border border-white p-5" >
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.
            </div>
        </div>
    </div>
</template>

<script>
import Phaser, { NONE } from 'phaser'
import { useRouter } from 'vue-router'
import { EditorView, basicSetup } from 'codemirror';
import { python } from '@codemirror/lang-python';
import { onMounted } from 'vue';

export default {
    name: 'level2',
    setup() {
        // Setup ROUTER-DOM
        const router = useRouter()
        
        const back = () => {
            router.push('/levels')
        }

        // Setup Phaser
        const config = {
            type: Phaser.AUTO,
            parent: 'phaser-example',
            width: 990,
            height: 700,
            pixelArt: true,
            backgroundColor: '#026bc6',
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
        }

        let player
        let platforms
        let trap_platforms
        let pass_platforms
        let ladder_platforms
        let player_stats = 'idle'

        let curr_posX
        let curr_posY

        function preload() {
            this.load.atlas('knight', '/assets/knight.png', '/assets/knight.json')
            this.load.image('bg', '/assets/clouds.png')
            this.load.spritesheet('tiles', '/assets/fantasy-tiles.png', { frameWidth: 64, frameHeight: 64 })
        }
        function create() {
            // BACKGROUND
            this.add.image(500, 48, 'bg').setOrigin(0.5, 0).setScale(1.5)
            
            platforms = this.physics.add.staticGroup()
            trap_platforms = this.physics.add.staticGroup()
            pass_platforms = this.physics.add.staticGroup()
            ladder_platforms = this.physics.add.staticGroup()

            // ADDING BLOCKS
            for (let i = 4; i < 7; i++) trap_platforms.create(64 * i, 670, 'tiles', 35) // spike traps
            for (let i = 8; i < 10; i++) trap_platforms.create(64 * i, 670, 'tiles', 35) // spike traps
            for (let i = 4; i < 7; i++) platforms.create(64 * i, 360, 'tiles', 28) // box ground
            for (let i = 8; i < 12; i++) platforms.create(64 * i, 510, 'tiles', 28) // box ground
            for (let i = 9; i < 11; i++) platforms.create(64 * i, 265, 'tiles', 28) // box ground
            for (let i = 0; i < 5; i++) ladder_platforms.create(64 * 3, 350 + i * 64, 'tiles', 56) // ladder
            for (let i = 0; i < 4; i++) ladder_platforms.create(64 * 11, 255 + i * 64, 'tiles', 56) // ladder
            for (let i = 0; i < 3; i++) ladder_platforms.create(64 * 7, 480 + i * 64, 'tiles', 56) // ladder
            for (let i = 0; i < 7; i++) platforms.create(64 * 13, 0 + i * 64, 'tiles', 27) // Wall
            for (let i = 0; i < 4; i++) platforms.create(64 * i, 670, 'tiles') // ground
            for (let i = 7; i < 8; i++) platforms.create(64 * i, 670, 'tiles') // ground
            for (let i = 10; i < 17; i++) platforms.create(64 * i, 670, 'tiles') // ground
            for (let i = 7; i < 8; i++) pass_platforms.create(64 * i, 610, 'tiles', 42) // coins
            for (let i = 9; i < 10; i++) pass_platforms.create(64 * i, 190, 'tiles', 42) // coins
            for (let i = 15; i < 16; i++) platforms.create(64 * i, 610, 'tiles', 57) // chest

            // PLAYER ANIMATIONS
            this.anims.create({
                key: 'idle',
                frames: this.anims.generateFrameNames('knight', { prefix: 'idle/frame', start: 0, end:5 , zeroPad: 4  }),
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

            // PLAYER SETUP
            player = this.physics.add.sprite(93, 450, 'knight')
            player.setScale(3)
            player.setSize(player.width * 0.27, player.height * 0.8)
            player.setOffset(player.width * 0.24, player.height * 0.2)

            this.physics.add.collider(player, platforms)
            player.setBounce(0.2)
            player.setCollideWorldBounds(true)
        }
        function update() {
            player.play(player_stats, true)

            if (player_stats === 'run') {
                if (!curr_posX) curr_posX = player.x
                player.setVelocityX(160)
                if ((player.x - curr_posX) > 59) {
                    player.setVelocityX(0)
                    player_stats = 'idle'
                    curr_posX = null
                }
            }
        }

        // CODEMIRROR
        // Use the onMounted hook to ensure that DOM is fully rendered before initialising the Codemirror components
        let view
        onMounted(() => {
            new Phaser.Game(config)

            view = new EditorView({
                extensions: [
                    basicSetup,
                    python()
                ],
                parent: document.getElementById('editor')
            })
        })

        function runCode() {
            if (view.state.doc.text.includes('hero.attack()')) {
                player_stats = 'attack'
            }
            if (view.state.doc.text.includes('hero.moveRight()')) {
                player_stats = 'run'
            }
            if (view.state.doc.text.includes('hero.moveUp()')) {
                player_stats = 'jump'
            }
            if (view.state.doc.text.includes('hero.moveLeft')) {
                player_stats = 'run'
            }
        }

        return { back, runCode }
    }
}
</script>