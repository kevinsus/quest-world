<template>
  <div id="game-container"></div>
</template>

<script>
import Phaser from 'phaser';

export default {
  name: 'Level1',
  mounted() {
    // Define the Phaser Scene
    class Example extends Phaser.Scene {
      preload() {
        this.load.setBaseURL('https://labs.phaser.io');
        this.load.image('sky', 'assets/skies/space3.png');
        this.load.image('logo', 'assets/sprites/phaser3-logo.png');
        this.load.image('red', 'assets/particles/red.png');
      }

      create() {
        this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'sky')
            .setDisplaySize(window.innerWidth, window.innerHeight)

        const particles = this.add.particles(0, 0, 'red', {
          speed: 100,
          scale: { start: 1, end: 0 },
          blendMode: 'ADD',
        });

        const logo = this.physics.add.image(window.innerWidth / 2, 100, 'logo');

        logo.setVelocity(100, 200);
        logo.setBounce(1, 1);
        logo.setCollideWorldBounds(true);

        particles.startFollow(logo);
      }
    }

    // Phaser Game Configuration
    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      scene: Example,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 200 },
        },
      },
      parent: 'game-container', // Attach Phaser canvas to this div
    };

    // Initialize the Phaser Game
    const game = new Phaser.Game(config);
  },
};
</script>
