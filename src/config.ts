import { MainScene } from './scenes/main-scene';

type ExternalConfig = {
  gameWidth: number,
  gameHeight: number,
}

export const PhaserConfig = (config: ExternalConfig):Phaser.Types.Core.GameConfig => ({
  title: 'Chunked tiles 2d game',
  version: '0.1',
  width: config.gameWidth,
  height: config.gameHeight,
  type: Phaser.AUTO,
  parent: 'game',
  physics: {
    default: 'arcade',
    arcade: {
        debug: true
    }
  },
  scene: [MainScene],
});
