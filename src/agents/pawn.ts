import { WorldScene } from "../scenes/main-scene";
import { getSpritesheet } from "./spritesheets";

type PathOp = "up" | "down" | "right" | "left" | "idle";

/**
 * An element that can move around and optionally collide.
 */
export class Pawn extends Phaser.Physics.Arcade.Sprite {
  private spritesheet: string;
  private currentState: PathOp = null;
  private movementSpeed: integer;

  static async load(
    targetScene: WorldScene,
    x: integer,
    y: integer,
    spritesheet: string,
    frameHeight: integer,
    frameWidth: integer,
    depth: integer,
    frame: integer = null,
    collide: "no" | "immovable" | "try" = "no",
    movementSpeed: integer
  ) {
    const sheetName = await getSpritesheet(
      targetScene.load,
      spritesheet,
      frameWidth,
      frameHeight
    );
    const ret: Pawn = new Pawn(targetScene, x, y, sheetName.name);
    targetScene.add.existing(ret)

    ret.spritesheet = spritesheet;

    ret.movementSpeed = movementSpeed;
    if (collide !== "no") {
      targetScene.addCollidingAgent(ret);
    }
    if (collide === "immovable") {
      ret.setImmovable(false);
    }
    targetScene.anims.create({
      key: spritesheet + "_down",
      frames: targetScene.anims.generateFrameNumbers(sheetName.name, {
        frames: [0, 1, 2],
      }),
      frameRate: 5,
      repeat: -1,
    });
    targetScene.anims.create({
      key: spritesheet + "_right",
      frames: targetScene.anims.generateFrameNumbers(sheetName.name, {
        frames: [3, 4, 5],
      }),
      frameRate: 5,
      repeat: -1,
    });
    targetScene.anims.create({
      key: spritesheet + "_up",
      frames: targetScene.anims.generateFrameNumbers(sheetName.name, {
        frames: [6, 7, 8],
      }),
      frameRate: 5,
      repeat: -1,
    });
    targetScene.anims.create({
      key: spritesheet + "_left",
      frames: targetScene.anims.generateFrameNumbers(sheetName.name, {
        frames: [9, 10, 11],
      }),
      frameRate: 5,
      repeat: -1,
    });

    ret.setDepth(depth);
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
}
