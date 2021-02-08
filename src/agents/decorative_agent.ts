import { WorldScene } from "../scenes/main-scene";
import { getSpritesheet } from "./spritesheets";

/**
 * An agent without interaction, it moves following a path or stands still.
 */
export class DecorativeAgent {
  private sprite: Phaser.Physics.Arcade.Sprite;
  private staticImage: Phaser.GameObjects.Image;

  private spritesheet: string;
  private path: string[];
  private timeInCycle: integer = 0;
  private stepDuration: integer = 1000;
  private currentState: string = null;

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
    path: string = null,
    collide: "no" | "immovable" | "try" = "no"
  ) {
    if (animated && frame !== null) {
      throw Error("Cannot have animated = true AND a frame at the same time");
    }
    this.path = (path?.split(",") || []).map((p) => p.trim().toLowerCase());
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
    return { shouldUpdate: this.path.length > 0 };
  }
  destroy(): void {
    if (this.staticImage) {
      this.staticImage.destroy();
    } else {
      this.sprite.destroy();
    }
  }
  update(time: number, delta: number) {
    // calculate the current position in the cycle
    this.timeInCycle += delta;
    this.timeInCycle =
      this.timeInCycle % (this.path.length * this.stepDuration);
    const op = this.path[Math.floor(this.timeInCycle / this.stepDuration)];

    if (op === "up" || op === "down") {
      this.sprite.setVelocityX(0);
      this.sprite.setVelocityY(op === "up" ? -128 : 128);
    }
    if (op === "right" || op === "left") {
      this.sprite.setVelocityY(0);
      this.sprite.setVelocityX(op === "left" ? -128 : 128);
    }
    if (op === "idle") {
      this.sprite.setVelocityY(0);
      this.sprite.setVelocityX(0);
      this.sprite.stop();
    }

    if (this.currentState != op && op !== "idle") {
      this.sprite.play(this.spritesheet + "_" + op);
    }
  }
}
