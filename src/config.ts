import { WorldScene } from "./scenes/main-scene";
import { GameGlobalConfig } from "./generated_types/game";

export const PhaserConfig = (
  config: GameGlobalConfig
): Phaser.Types.Core.GameConfig => ({
  title: config.gameTitle,
  version: "0.1",
  width: config.gameScreenWidth,
  height: config.gameScreenHeight,
  type: Phaser.AUTO,
  parent: "game",
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: [WorldScene],
  plugins: {
    global: [],
  },
});
