import { WorldScene } from "./scenes/main-scene";
import { AdventureConfig } from "./index";

export const PhaserConfig = (
  config: AdventureConfig
): Phaser.Types.Core.GameConfig => ({
  title: config.gameTitle,
  version: "0.1",
  width: config.gameWidth,
  height: config.gameHeight,
  type: Phaser.AUTO,
  parent: "game",
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
    },
  },
  scene: [WorldScene],
});
