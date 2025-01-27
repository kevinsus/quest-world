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
 * 2.1 GOING DOWN LADDER
 * 2.2 POP UP FOR: GOING NEXT LEVEL, PUTTING WRONG COMMAND
 * 3.0 CHEST ATTACK ANIMATION
 * 4.0 COIN ANIMATION and EARN COINS
 * 5.0 SCOREBOARD and TUTORIAL VIDEO (after completing each level)
 * 6.0 MOBILE SUPPORT <?>
 * 
 * BUGS: 
 * - PLAYER KEEP JUMPING WHEN CLIMBING LADDER
 * - PLAYER KEEP MOVING WHEN HITTING WALL
 * - PLAYER TURNING LEFT
 * - REPETITIVE CODE (All levels has the same logic, with different maps)
 */

import Phaser from 'phaser'
import { useRouter, useRoute } from 'vue-router'
import { EditorView, basicSetup } from 'codemirror';
import { python } from '@codemirror/lang-python';
import { onMounted, ref } from 'vue';
import { levelConfig } from '@/components/levels/levels.json'

export default {
    name: 'level',
    setup() {
        // Get level number
        const levelPath = (useRoute().fullPath.match(/^\/levels\/level(\d+)$/))
        const numLevel = parseInt(levelPath[1], 10)

        // Setup Cards
        let showCardIndex = ref(0)
        const cards = ref(levelConfig[`level${numLevel}`].chatlogs)

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

        let curr_posX = 0
        let curr_posY = 0
        let numMove = 0

        let filteredCommands = []
        
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
            const maps = levelConfig[`level${numLevel}`].maps
            const ladder_platform_blocks = maps.ladder_platforms
            const trap_platforms_blocks = maps.trap_platforms
            const platform_blocks = maps.platforms
            const pass_platform_blocks = maps.pass_platforms

            if (ladder_platform_blocks) {
                for (const block of ladder_platform_blocks) {
                    for (let i = block.pos_i_start; i < block.pos_i_end; i++) platforms.create(64 * block.pos_block_i, block.poss_block + i * 64, 'tiles', block.pos_sprite)  
                }
            }
            if (trap_platforms_blocks) {
                for (const block of trap_platforms_blocks) {
                    for (let i = block.pos_i_start; i < block.pos_i_end; i++) platforms.create(64 * i, block.poss_block, 'tiles', block.pos_sprite)   
                }
            }
            if (platform_blocks) {
                for (const block of platform_blocks) {
                    for (let i = block.pos_i_start; i < block.pos_i_end; i++) platforms.create(64 * i, block.poss_block, 'tiles', block.pos_sprite)   
                }
            }
            if (pass_platform_blocks) {
                for (const block of pass_platform_blocks) {
                    for (let i = block.pos_i_start; i < block.pos_i_end; i++) platforms.create(64 * i, block.poss_block, 'tiles', block.pos_sprite)   
                }
            }
            

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
                else if (numMove === 0 && filteredCommands.length > 0) {
                    runCode()
                }

            }

            // DIE Animation
            if (this.physics.overlap(player, trap_platforms) && player.anims.getName() !== 'die') {
                player_stats = 'die'
                player.play('die', true)
                this.time.delayedCall(3000, () => {
                    this.scene.restart();
                });
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
            // When run code button is pressed, this function will run
            // 1. it will first filter the commands from empty string
            // 2. it will take the first command
            // 3. check if command exist and valid => if yes, it will remove that command from the filteredCommandsArray
            // 4. it will then find the right animation to run

            if (filteredCommands.length === 0) filteredCommands = (view.state.doc.text).filter(e => e)
            let executeCommand = filteredCommands[0]
            
            if (executeCommand && filteredCommands.length > 0) {
                filteredCommands.shift()

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