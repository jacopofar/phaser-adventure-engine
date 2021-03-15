import { WorldScene } from "../scenes/main-scene";
import { getSpritesheet } from "./spritesheets";

type PathOp = "up" | "down" | "right" | "left" | "idle";
export interface PawnConfig {
  x: integer;
  y: integer;
  spritesheet: string;
  frameHeight: integer;
  frameWidth: integer;
  depth: integer;
  collide: "no" | "immovable" | "try";
  movementSpeed: integer;
}

/**
 * An element that can move around and optionally collide.
 */
export class Pawn extends Phaser.Physics.Arcade.Sprite {
  private spritesheet: string;
  private currentState: PathOp = null;
  private movementSpeed: integer;
  private collideFun: (other: any) => void;

  construnctor() {
    // the constructor cannot be async, and creating a pawn without the data
    // from the async http request would only create confusion
    throw Error(
      "This class cannot be instantiated, use Pawn.createPawn instead"
    );
  }

  static async createPawn(targetScene: WorldScene, config: PawnConfig) {
    const sheetName = await getSpritesheet(
      targetScene.load,
      config.spritesheet,
      config.frameWidth,
      config.frameHeight
    );
    const ret: Pawn = new Pawn(targetScene, config.x, config.y, sheetName.name);
    targetScene.add.existing(ret);

    ret.spritesheet = config.spritesheet;

    ret.movementSpeed = config.movementSpeed;
    if (config.collide !== "no") {
      targetScene.addCollidingPawn(ret);
    }
    if (config.collide === "immovable") {
      ret.setImmovable(false);
    }
    targetScene.anims.create({
      key: config.spritesheet + "_down",
      frames: targetScene.anims.generateFrameNumbers(sheetName.name, {
        frames: [0, 1, 2],
      }),
      frameRate: 5,
      repeat: -1,
    });
    targetScene.anims.create({
      key: config.spritesheet + "_right",
      frames: targetScene.anims.generateFrameNumbers(sheetName.name, {
        frames: [3, 4, 5],
      }),
      frameRate: 5,
      repeat: -1,
    });
    targetScene.anims.create({
      key: config.spritesheet + "_up",
      frames: targetScene.anims.generateFrameNumbers(sheetName.name, {
        frames: [6, 7, 8],
      }),
      frameRate: 5,
      repeat: -1,
    });
    targetScene.anims.create({
      key: config.spritesheet + "_left",
      frames: targetScene.anims.generateFrameNumbers(sheetName.name, {
        frames: [9, 10, 11],
      }),
      frameRate: 5,
      repeat: -1,
    });

    ret.setDepth(config.depth);
    return ret;
  }

  move(op: PathOp) {
    if (op === "up" || op === "down") {
      this.setVelocityX(0);
      this.setVelocityY(op === "up" ? -this.movementSpeed : this.movementSpeed);
    }
    if (op === "right" || op === "left") {
      this.setVelocityY(0);
      this.setVelocityX(
        op === "left" ? -this.movementSpeed : this.movementSpeed
      );
    }
    if (op === "idle") {
      this.setVelocityY(0);
      this.setVelocityX(0);
      this.stop();
    }

    if (this.currentState != op && op !== "idle") {
      this.play(this.spritesheet + "_" + op);
    }
    this.currentState = op;
  }

  onCollide(cb: (other: any) => void) {
    this.collideFun = cb;
  }

  collide(other: any) {
    if (this.collideFun) {
      this.collideFun(other);
    }
  }
}
