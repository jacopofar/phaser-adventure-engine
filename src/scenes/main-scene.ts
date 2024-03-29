import "phaser";
import { ChunkManager } from "../maps/chunk_manager";
import { AdventureData } from "../index";

import { Pawn, PathOp } from "../agents/pawn";

export class WorldScene extends Phaser.Scene {
  public obstacles: Phaser.Physics.Arcade.StaticGroup;
  public movingPawns: Phaser.Physics.Arcade.Group;

  private playerPawn: Pawn;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private chunkManager: ChunkManager;
  private currentMovementOp: PathOp = "idle";
  private facingDirection: PathOp = "idle";
  private reactToInput: boolean = true;
  private currentlyInteracting: boolean = false;

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
    this.playerPawn = await Pawn.createPawn(this, {
      x: adventureData.startX,
      y: adventureData.startX,
      spritesheet: adventureData.playerSpriteSheet,
      frameHeight: adventureData.playerSpriteHeight,
      frameWidth: adventureData.playerSpriteWidth,
      depth: 1,
      collide: "immovable",
      movementSpeed: 128,
    });
    // TODO: this will later handle the logic for the game interaction
    this.physics.add.collider(this.playerPawn, this.obstacles, (a, b) => {
      // console.log("collision with static object", a, b);
    });
    // this is a collision between an agent (or the player) and a static obstacle
    // so far, there's no use for it
    this.physics.add.collider(this.movingPawns, this.obstacles);
    this.physics.add.collider(this.playerPawn, this.movingPawns, (a, b) => {
      // console.log("collision with moving sprite", a, b);
      (b as Pawn).collide(a);
    });
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cameras.main.startFollow(this.playerPawn);

    // this is to avoid the pixel aliasing (appears as a border on every tile when moving)
    // note that it is also available as option in startFollow()
    this.cameras.main.setRoundPixels(true);
    const minVisibilityRadius = Math.max(
      adventureData.gameScreenWidth,
      adventureData.gameScreenHeight
    );
    this.chunkManager = new ChunkManager(
      Math.max(minVisibilityRadius, 1000),
      128 + Math.max(minVisibilityRadius, 1000)
    );
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
  /**
   * Performs the agent interaction if there's a Pawn facing the player one
   */
  private async performInteraction() {
    // determine where it is facing
    let offx: integer = 0;
    let offy: integer = 0;
    if (this.facingDirection === "right") {
      offx = this.playerPawn.width;
    }
    if (this.facingDirection === "left") {
      offx = -this.playerPawn.width;
    }
    if (this.facingDirection === "up") {
      offy = -this.playerPawn.height;
    }
    if (this.facingDirection === "down") {
      offy = this.playerPawn.height;
    }

    const dynBodies = this.physics.overlapRect(
      this.playerPawn.x + offx,
      this.playerPawn.y + offy,
      this.playerPawn.width,
      this.playerPawn.height,
      true,
      false
    );
    for (const bod of dynBodies) {
      const obj = bod.gameObject;
      if (Pawn.isPawn(obj) && obj !== this.playerPawn) {
        await obj.interact();
      }
    }
  }

  async update(time: number, delta: number): Promise<void> {
    if (this.reactToInput) {
      if (this.cursors.space.isDown && !this.currentlyInteracting) {
        this.currentlyInteracting = true;
        await this.performInteraction();
        this.currentlyInteracting = false;
      }

      // if mouse/touch is used, ignore the keyboard
      if (this.game.input.activePointer.isDown) {
        const deltaX = this.game.input.activePointer.worldX - this.playerPawn.x;
        const deltaY = this.game.input.activePointer.worldY - this.playerPawn.y;
        // if the distance is less than player sprite width, assume it's an interaction
        if (
          Math.sqrt(deltaX ** 2 + deltaY ** 2) < this.playerPawn.width &&
          !this.currentlyInteracting
        ) {
          this.currentlyInteracting = true;
          await this.performInteraction();
          this.currentlyInteracting = false;
        } else {
          // there is no idle when the click is used, always a currentMovementOp
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            this.currentMovementOp = deltaX > 0 ? "right" : "left";
          } else {
            this.currentMovementOp = deltaY > 0 ? "down" : "up";
          }
        }
      } else {
        // no mouse, maybe it is keyboard
        if (this.cursors.left.isDown || this.cursors.right.isDown) {
          this.currentMovementOp = this.cursors.left.isDown ? "left" : "right";
        } else {
          if (this.cursors.up.isDown || this.cursors.down.isDown) {
            this.currentMovementOp = this.cursors.up.isDown ? "up" : "down";
          } else {
            // nothing being pressed
            this.currentMovementOp = "idle";
          }
        }
      }
      this.playerPawn.move(this.currentMovementOp);
      if (this.currentMovementOp !== "idle") {
        this.facingDirection = this.currentMovementOp;
      }

      await this.chunkManager.handleNewPosition(
        this,
        Math.floor(this.playerPawn.x),
        Math.floor(this.playerPawn.y)
      );
    }
    this.chunkManager.update(time, delta);
  }
  ignoreInput(state: boolean) {
    this.reactToInput = !state;
  }
  async teleport(map: string, x: integer, y: integer) {
    await this.chunkManager.loadWorld(map);
    this.playerPawn.x = x;
    this.playerPawn.y = y;
    await this.chunkManager.handleNewPosition(this, x, y);
  }
}
