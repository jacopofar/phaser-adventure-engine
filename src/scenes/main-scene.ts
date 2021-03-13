import "phaser";

import { ChunkManager } from "../maps/chunk_manager";
import { AdventureData } from "../index";

import { Pawn } from "../agents/pawn";

export class WorldScene extends Phaser.Scene {
  public obstacles: Phaser.Physics.Arcade.StaticGroup;
  public movingPawns: Phaser.Physics.Arcade.Group;

  private playerPawn: Pawn;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private chunkManager: ChunkManager;
  private direction: "up" | "down" | "right" | "left" | "idle" = "idle";

  constructor() {
    super({ key: "MainScene" });
  }

  preload(): void {
    const adventureData = AdventureData.getGameData(this);
    this.load.spritesheet("player", adventureData.playerSpriteSheet, {
      frameWidth: adventureData.playerSpriteWidth,
      frameHeight: adventureData.playerSpriteHeight,
    });
  }

  async create(): Promise<void> {
    // pause first, or it would invoke update() before the chunkmanager even loaded the world
    this.scene.pause();

    const adventureData = AdventureData.getGameData(this);

    this.obstacles = this.physics.add.staticGroup();
    this.movingPawns = this.physics.add.group();
    this.playerPawn = await Pawn.createPawn(
      this,
      adventureData.startX,
      adventureData.startX,
      adventureData.playerSpriteSheet,
      adventureData.playerSpriteHeight,
      adventureData.playerSpriteWidth,
      1,
      "immovable",
      128
    );
    // TODO: this will later handle the logic for the game interaction
    this.physics.add.collider(this.playerPawn, this.obstacles, (a, b) => {
      // console.log("collision with static object", a, b);
    });
    // this is a collision between an agent (or the player) and a static obstacle
    // so far, there's no use for it
    this.physics.add.collider(this.movingPawns, this.obstacles);
    this.physics.add.collider(this.playerPawn, this.movingPawns, (a, b) => {
      // console.log("collision with moving sprite", a, b);
    });
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cameras.main.startFollow(this.playerPawn);

    // this is to avoid the pixel aliasing (appears as a border on every tile when moving)
    // note that it is also available as option in startFollow()
    this.cameras.main.setRoundPixels(true);
    this.chunkManager = new ChunkManager();
    await this.chunkManager.loadWorld(adventureData.initialWorld);
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

  addCollidingPawn(pawn: Pawn) {
    this.movingPawns.add(pawn);
  }

  async update(time: number, delta: number): Promise<void> {
    const previousDirection = this.direction;
    // if mouse/touch is used, ignore the keyboard
    if (this.game.input.activePointer.isDown) {
      const deltaX = this.game.input.activePointer.worldX - this.playerPawn.x;
      const deltaY = this.game.input.activePointer.worldY - this.playerPawn.y;
      // there is no idle when the click is used, always a direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        this.direction = deltaX > 0 ? "right" : "left";
      } else {
        this.direction = deltaY > 0 ? "down" : "up";
      }
    } else {
      // no mouse, maybe it is keyboard
      if (this.cursors.left.isDown || this.cursors.right.isDown) {
        this.direction = this.cursors.left.isDown ? "left" : "right";
      } else {
        if (this.cursors.up.isDown || this.cursors.down.isDown) {
          this.direction = this.cursors.up.isDown ? "up" : "down";
        } else {
          // nothing being pressed
          this.direction = "idle";
        }
      }
    }
    this.playerPawn.move(this.direction);

    await this.chunkManager.handleNewPosition(
      this,
      Math.floor(this.playerPawn.x),
      Math.floor(this.playerPawn.y)
    );
    this.chunkManager.update(time, delta);
  }
}
