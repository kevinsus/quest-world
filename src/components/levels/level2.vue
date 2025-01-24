<template>
    <div id="glass-container" class="bg-[url('/assets/game_bg.jpg')] bg-[length:200px] bg-repeat flex h-screen p-2">
        <div id="phaser-example" >
            <button @click="back" class="rounded rounded-xl bg-[url('/assets/instructions_bg.jpg')] p-2 px-10 text-white m-2">Map</button>
        </div>
        <div class="w-full h-full m-5 space-y-1" >
            <div id="editor" class="h-[70%] bg-[url('/assets/code_bg.webp')] rounded rounded-xl border border-white p-5 relative" >
                <button class="absolute bg-[url('/assets/instructions_bg.jpg')] text-white bottom-0 left-0 right-0 p-2 rounded rounded-xl m-3" @click="runCode()" >RUN</button>
            </div>
            <div id="instruction" class="h-[24%] bg-[url('/assets/instructions_bg.jpg')] rounded rounded-xl border border-white p-5 relative" >
                <div v-for="(card, index) in cards"
                    :key="index"
                    v-show="showCardIndex === index"
                >
                    <p class="text-white" >{{ card }}</p>
                </div>
                <div class="absolute bottom-0 w-full">
                    <button @click="prevCard" :disabled="showCardIndex === 0" class="p-2 rounded rounded-xl bg-white w-1/4 m-2" >
                        Back
                    </button>
                    <button @click="nextCard" :disabled="showCardIndex === cards.length - 1" class="p-2 rounded rounded-xl bg-white w-1/4 m-2" >
                        Next
                    </button>
                </div>
            </div>
        </div> 
    </div>
</template>

<script>
/*
 * TODO:
 * 1.1 MULTIPLE COMMAND SUPPORT
 * 1.2 MAIN MENU UI / UX
 * 2.1 GOING DOWN LADDER
 * 2.2 POP UP FOR: GOING NEXT LEVEL, PUTTING WRONG COMMAND
 * 2.3 HINTS AND TASKS
 * 3.0 CHEST ATTACK ANIMATION
 * 4.0 COIN ANIMATION and EARN COINS
 * 5.0 SCOREBOARD and TUTORIAL VIDEO (after completing each level)
 * 6.0 MOBILE SUPPORT <?>
 * 
 * BUGS: 
 * - PLAYER KEEP JUMPING WHEN CLIMBING LADDER
 * - PLAYER KEEP MOVING WHEN HITTING WALL
 * - PLAYER TURNING LEFT
 */

import Phaser from 'phaser'
import { useRouter } from 'vue-router'
import { EditorView, basicSetup } from 'codemirror';
import { python } from '@codemirror/lang-python';
import { onMounted, ref } from 'vue';

export default {
    name: 'level2',
    setup() {
        // Setup Cards
        let showCardIndex = ref(0)
        const cards = ref([
            "Today, you will learn how to use a code editor in Python.",
            "Python is a widely used programming language for Web Development, Software Development, Data Science, Machine Learning, Automation",
            "First and the most important step is to initialize the character. To begin, type:\n`var hero`.",
            "Once successful, you should see the character of your player. To make it move, type:\n`hero.moveRight(1)`.",
            "To attack the chest, type:\n`hero.attack()`.\nNow you know the basics to move and make the hero attack. Move the character to the chest and attack it.",
            "Enjoy your first mission!",
        ])

        const prevCard = () => {
            if (showCardIndex.value > 0) showCardIndex.value--
        }
        
        const nextCard = () => {
            if (showCardIndex.value < cards.value.length - 1) showCardIndex.value++
        }

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
                    debug: false,
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

        let curr_posX = 0
        let curr_posY = 0
        let numMove = 0
        let execute = false
        
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
            player.setSize(player.width * 0.25, player.height * 0.8)
            player.setOffset(player.width * 0.25, player.height * 0.2)

            this.physics.add.collider(player, platforms)
            player.setBounce(0.2)
            player.setCollideWorldBounds(true)
            
            player_stats = 'idle'
        }
        function update() {            
            if (player_stats === 'attack') player.play('attack', true)
            if (player_stats != 'die') {
                if (player_stats === 'idle'
                    || player_stats === 'idle_right'
                    || player_stats === 'idle_left'
                    // || player_stats === 'idle_jump_ladder'
                    || player_stats === 'idle_jump'
                ) player.play('idle', true)
                
                // Moving Animations
                if (numMove > 0) {
                    if (player_stats === 'idle_right') player_stats = 'run_right'
                    if (player_stats === 'idle_left') player_stats = 'run_left'
                    if (player_stats === 'idle_jump') player_stats = 'jump'

                    // RUN RIGHT Animation
                    if (player_stats === 'run_right') {
                        player.body.setAllowGravity(true)

                        if (curr_posX === 0) curr_posX = player.x
                
                        if ((player.x - curr_posX) <= 60) {
                            player.play('run', true)
                            player.setFlipX(false)
                            player.setVelocityX(160)
                        }
                        else {
                            player.setVelocityX(0)
                            curr_posX = 0
                            player_stats = 'idle_right'
                            numMove -= 1
                        }
                    }
                    
                    // RUN LEFT Animation
                    if (player_stats === 'run_left') {
                        player.body.setAllowGravity(true)

                        if (curr_posX === 0) curr_posX = player.x
                        
                        if ((curr_posX - player.x) <= 60) {
                            player.play('run', true)
                            player.setFlipX(true)
                            player.setVelocityX(-160)
                        }
                        else {
                            player.setVelocityX(0)
                            curr_posX = 0
                            player_stats = 'idle_left'
                            numMove -= 1
                        }
                    }

                    // Jump Animations
                    if (player_stats === 'jump') {
                        if (this.physics.overlap(player, ladder_platforms)) {
                            player.body.setAllowGravity(false)

                            // LADDER JUMP Animation
                            if (curr_posY === 0) curr_posY = player.y
                    
                            if ((curr_posY - player.y) <= 50) {
                                player.play('jump', true)
                                player.setVelocityY(-330)
                            }
                            else {
                                player.setVelocityY(0)
                                curr_posY = 0
                                player_stats = 'idle_jump'
                                numMove -= 1
                            }
                        } else {
                            // NORMAL JUMP Animation
                            player.body.setAllowGravity(true)

                            if (player.body.touching.down) {
                                player.setVelocityY(-330)
                                player.play('jump', true)
                                player_stats = 'idle_jump'
                                numMove -= 1
                            }
                        }
                    }
                } 
                else if (numMove === 0 && execute) {
                    console.log(view.state.doc.text)
                    runCommand(view.state.doc.text)
                }
            }

            // DIE Animation
            if (this.physics.overlap(player, trap_platforms) && player.anims.getName() !== 'die') {
                execute = false
                player_stats = 'die'
                player.play('die', true)
                this.time.delayedCall(3000, () => {
                    this.scene.restart();
                });
            }
        }

        function runCommand(commands) {
            const filteredCommands = commands.filter(e => e)
            // Remove first element from commands
            if (filteredCommands.length > 1) {
                // console.log('hello')
                commands.shift()
                runCode()
            }
        }

        // Setup CODEMIRROR
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
            execute = true
            let executeCommand = view.state.doc.text[0]
            if (executeCommand) {
                if (/^hero.attack\(\)$/.test(executeCommand)) {
                    player_stats = 'attack'
                } else if (executeCommand.match(/.*\((\d+)\)$/)) {
                    const match = executeCommand.match(/.*\((\d+)\)$/) // regex for capture the number of repetition
                    numMove = parseInt(match[1], 10)
                    
                    if (/^hero.moveRight\(\d+\)$/.test(executeCommand)) {
                        player_stats = 'run_right'
                    }
                    else if (/^hero.moveUp\(\d+\)$/.test(executeCommand)) {
                        player_stats = 'jump'
                    }
                    else if (/^hero.moveLeft\(\d+\)$/.test(executeCommand)) {
                        player_stats = 'run_left'
                    }
                    else {
                        player_stats = 'idle'
                        console.log('no match string')
                    }
                } else {
                    console.log('no match string')
                }

            }
        }

        return { showCardIndex, cards, back, runCode, prevCard, nextCard }
    }
}
</script>