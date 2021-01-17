import { MainScene } from './scenes/main-scene';

export const GameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Chunked tiles 2d game',
  version: '0.1',
  width: 800,
  height: 600,
  type: Phaser.AUTO,
  parent: 'game',
  physics: {
    default: 'arcade',
    arcade: {
        debug: true
    }
  },
  scene: [MainScene]
};
