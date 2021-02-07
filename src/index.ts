import "phaser";
const axios = require("axios").default;

import { PhaserConfig } from "./config";
import { WorldScene } from "./scenes/main-scene";

/**
 * Data loaded from the game.json
 */
export type AdventureConfig = {
  gameTitle: string;
  gameWidth: number;
  gameHeight: number;
  playerSpritesheet: string;
};

/**
 * Class to keep the global state of the game.
 *
 */
export class AdventureData {
  private _playerSpritesheet: string;
  constructor(config: AdventureConfig) {
    this._playerSpritesheet = config.playerSpritesheet;
  }
  /**
   * Return the path for the player spritesheet
   */
  get playerSpriteSheet(): string {
    return this._playerSpritesheet;
  }
  static getGameData(scene: WorldScene) {
    return scene.game.registry.get("adventure_data") as AdventureData;
  }
  static setConfig(game: Phaser.Game, config: AdventureConfig) {
    game.registry.set("adventure_data", new AdventureData(config));
  }
}

window.addEventListener("load", async () => {
  try {
    const config: AdventureConfig = (await axios.get("/game/game.json")).data;
    const game = new Phaser.Game(PhaserConfig(config));
    AdventureData.setConfig(game, config);
  } catch (error) {
    window.alert("Error loading game manifest :-(");
    console.error(error);
  }
});
