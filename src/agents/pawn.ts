import { WorldScene } from "../scenes/main-scene";
import { getSpritesheet } from "./spritesheets";

type PathOp = "up" | "down" | "right" | "left" | "idle";

/**
 * An element that can move around and optionally collide.
 */
export class Pawn {
  private sprite: Phaser.Physics.Arcade.Sprite;
  private staticImage: Phaser.GameObjects.Image;

  private spritesheet: string;
  private currentState: PathOp = null;
  private movementSpeed: integer;

  get x(): integer {
    if (this.sprite) {
      return this.sprite.x;
    } else {
      return this.staticImage.x;
    }
  }

  get y(): integer {
    if (this.sprite) {
      return this.sprite.y;
    } else {
      return this.staticImage.y;
    }
  }

  get physicsSprite(): Phaser.Physics.Arcade.Sprite {
    if (this.sprite) {
      return this.sprite;
    } else {
      throw new Error("This pawn is a static image, it has no physics sprite!");
    }
  }

  async load(
    targetScene: WorldScene,
    x: integer,
    y: integer,
    spritesheet: string,
    frameHeight: integer,
    frameWidth: integer,
    depth: integer,
    animated: boolean = false,
    frame: integer = null,
    collide: "no" | "immovable" | "try" = "no",
    movementSpeed: integer
  ) {
    if (animated && frame !== null) {
      throw Error("Cannot have animated = true AND a frame at the same time");
    }
    this.movementSpeed = movementSpeed;
    const sheetName = await getSpritesheet(
      targetScene.load,
      spritesheet,
      frameWidth,
      frameHeight
    );
    if (frame !== null) {
      this.staticImage = targetScene.add.image(x, y, sheetName.name, frame);
    } else {
      this.spritesheet = spritesheet;
      this.sprite = targetScene.physics.add.sprite(x, y, sheetName.name, frame);
      if (collide !== "no") {
        targetScene.addCollidingAgent(this.sprite);
      }
      if (collide === "immovable") {
        this.sprite.setImmovable(false);
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
    }
    this.sprite.setDepth(depth);
  }
  destroy(): void {
    if (this.staticImage) {
      this.staticImage.destroy();
    } else {
      this.sprite.destroy();
    }
  }
  move(op: PathOp) {
    if (op === "up" || op === "down") {
      this.sprite.setVelocityX(0);
      this.sprite.setVelocityY(
        op === "up" ? -this.movementSpeed : this.movementSpeed
      );
    }
    if (op === "right" || op === "left") {
      this.sprite.setVelocityY(0);
      this.sprite.setVelocityX(
        op === "left" ? -this.movementSpeed : this.movementSpeed
      );
    }
    if (op === "idle") {
      this.sprite.setVelocityY(0);
      this.sprite.setVelocityX(0);
      this.sprite.stop();
    }

    if (this.currentState != op && op !== "idle") {
      this.sprite.play(this.spritesheet + "_" + op);
    }
    this.currentState = op;
  }
}
