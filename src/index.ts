import "phaser";
const axios = require("axios").default;

import { PhaserConfig } from "./config";
import { WorldScene } from "./scenes/main-scene";

import { GameGlobalConfig } from "./generated_types/game";

/**
 * Class to keep the global state of the game.
 *
 */
export class AdventureData {
  private _playerSpritesheet: string;
  private _startX: integer;
  private _startY: integer;
  private _initialWorld: string;
  private _playerSpriteWidth: integer;
  private _playerSpriteHeight: integer;
  private _tileWidthDefault: integer;
  private _tileHeightDefault: integer;
  private _gameScreenHeight: integer;
  private _gameScreenWidth: integer;

  constructor(config: GameGlobalConfig) {
    this._playerSpritesheet = config.playerSpritesheet;
    this._startX = config.startX;
    this._startY = config.startY;
    this._gameScreenHeight = config.gameScreenHeight;
    this._gameScreenWidth = config.gameScreenWidth;

    this._initialWorld = config.initialWorld;
    this._playerSpriteHeight = config.playerSpriteHeight || 32;
    this._playerSpriteWidth = config.playerSpriteWidth || 32;
    this._tileWidthDefault = config.tileWidth || 32;
    this._tileHeightDefault = config.tileHeight || 32;
  }
  /**
   * Return the path for the player spritesheet
   */
  get playerSpriteSheet(): string {
    return this._playerSpritesheet;
  }
  get startX(): integer {
    return this._startX;
  }
  get startY(): integer {
    return this._startY;
  }
  get initialWorld(): string {
    return this._initialWorld;
  }
  get playerSpriteWidth(): integer {
    return this._playerSpriteWidth;
  }
  get playerSpriteHeight(): integer {
    return this._playerSpriteHeight;
  }
  get tileHeightDefault(): integer {
    return this._tileHeightDefault;
  }
  get tileWidthDefault(): integer {
    return this._tileWidthDefault;
  }

  get gameScreenWidth(): integer {
    return this._gameScreenWidth;
  }

  get gameScreenHeight(): integer {
    return this._gameScreenHeight;
  }

  static getGameData(scene: WorldScene) {
    return scene.game.registry.get("adventure_data") as AdventureData;
  }
  static setConfig(game: Phaser.Game, config: GameGlobalConfig) {
    game.registry.set("adventure_data", new AdventureData(config));
  }
}

window.addEventListener("load", async () => {
  try {
    const config = (await axios.get("/game/game.json"))
      .data as GameGlobalConfig;
    const game = new Phaser.Game(PhaserConfig(config));
    AdventureData.setConfig(game, config);
  } catch (error) {
    console.log("Error loading game manifest :-(");
    console.error(error);
  }
});
