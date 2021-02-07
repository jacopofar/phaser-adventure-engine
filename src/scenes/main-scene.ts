import "phaser";

import { ChunkManager } from "../tiling/chunk_manager";
import { AdventureData } from "../index";

export class WorldScene extends Phaser.Scene {
  public obstacles: Phaser.Physics.Arcade.StaticGroup;

  private player: Phaser.Physics.Arcade.Sprite;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private chunkManager: ChunkManager;
  private direction: "up" | "down" | "right" | "left" | "idle" = "idle";

  constructor() {
    super({ key: "MainScene" });
  }

  preload(): void {
    this.load.spritesheet(
      "player",
      AdventureData.getGameData(this).playerSpriteSheet,
      {
        frameWidth: 36,
        frameHeight: 36,
      }
    );
  }

  async create(): Promise<void> {
    // first pause, or it will invoke update() before the chunkmanager even loaded the world
    this.scene.pause();

    const adventureData = AdventureData.getGameData(this);

    this.player = this.physics.add.sprite(
      adventureData.startX,
      adventureData.startX,
      "player"
    );
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
    await this.chunkManager.loadWorld(adventureData.initialWorld);
    //now the world data is loaded, the chunkmanager will load the needed chunks during the update()
    this.scene.resume();

    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers("player", { frames: [0, 1, 2] }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("player", { frames: [3, 4, 5] }),
      frameRate: 5,
      repeat: -1,
    });
    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers("player", { frames: [6, 7, 8] }),
      frameRate: 5,
      repeat: -1,
    });
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("player", {
        frames: [9, 10, 11],
      }),
      frameRate: 5,
      repeat: -1,
    });
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
    const previousDirection = this.direction;
    // if mouse/touch is used, ignore the keyboard
    if (this.game.input.activePointer.isDown) {
      const deltaX = this.game.input.activePointer.worldX - this.player.x;
      const deltaY = this.game.input.activePointer.worldY - this.player.y;
      // there is no idle when the click is used, always a direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        this.direction = (deltaX > 0) ? "right": "left";
      }
      else {
        this.direction = (deltaY > 0) ? "down": "up";
      }
    }
    else {
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

    if (this.direction === "up" || this.direction === "down") {
      this.player.setVelocityX(0);
      this.player.setVelocityY(this.direction === "up" ? -128 : 128);
    }
    if (this.direction === "right" || this.direction === "left") {
      this.player.setVelocityY(0);
      this.player.setVelocityX(this.direction === "left" ? -128 : 128);
    }
    if (this.direction === "idle") {
      this.player.setVelocityY(0);
      this.player.setVelocityX(0);
      this.player.stop();
    }

    if (previousDirection != this.direction && this.direction !== "idle") {
      this.player.play(this.direction);
    }

    await this.chunkManager.handleNewPosition(
      this,
      this.player.x,
      this.player.y
    );
  }
}
