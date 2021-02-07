import "phaser";

import { ChunkManager } from "../tiling/chunk_manager";
import { AdventureData } from "../index";

export class WorldScene extends Phaser.Scene {
  public obstacles: Phaser.Physics.Arcade.StaticGroup;

  private player: Phaser.Physics.Arcade.Sprite;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private chunkManager: ChunkManager;

  constructor() {
    super({ key: "MainScene" });
  }

  preload(): void {
    this.load.spritesheet(
      "player",
      AdventureData.getGameData(this).playerSpriteSheet,
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
  }

  async create(): Promise<void> {
    // first pause, or it will invoke update() before the chunkmanager even loaded the world
    this.scene.pause();
    this.player = this.physics.add.sprite(400, 300, "player");
    this.obstacles = this.physics.add.staticGroup();
    // TODO: this will later handle the logic for the game interaction
    this.physics.add.collider(this.player, this.obstacles, (a, b) => {
      console.log("collision between", a, b);
    });

    this.player.setDepth(1);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cameras.main.startFollow(this.player);
    // this is to avoid the pixel aliasing (appears as a border on every tile when moving)
    // note that it is also available as option in startFollow()
    this.cameras.main.setRoundPixels(true);
    this.chunkManager = new ChunkManager();
    await this.chunkManager.loadWorld("game/maps/second/world.world");
    //now the world data is loaded, the chunkmanager will load the needed chunks during the update()
    this.scene.resume();
  }

  /**
   * Add and return a static body and a sprite.
   *
   */
  addObstacle(
    x: integer,
    y: integer,
    texture: string,
    frame: integer
  ): Phaser.Types.Physics.Arcade.SpriteWithStaticBody {
    const img = this.physics.add.staticSprite(x, y, texture, frame);
    this.obstacles.add(img);
    return img;
  }

  async update(): Promise<void> {
    if (this.cursors.left.isDown || this.cursors.right.isDown) {
      this.player.setVelocityX(this.cursors.left.isDown ? -128 : 128);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown || this.cursors.down.isDown) {
      this.player.setVelocityY(this.cursors.up.isDown ? -128 : 128);
    } else {
      this.player.setVelocityY(0);
    }
    await this.chunkManager.handleNewPosition(
      this,
      this.player.x,
      this.player.y
    );
  }
}
