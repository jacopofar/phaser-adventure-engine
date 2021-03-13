import { WorldScene } from "../scenes/main-scene";
import { getSpritesheet } from "./spritesheets";
import { Pawn } from "./pawn";

type PathOp = "up" | "down" | "right" | "left" | "idle";

/**
 * An agent without interaction, it moves following a path or stands still.
 */
export class DecorativeAgent {
  private staticImage: Phaser.GameObjects.Image;
  private pawn: Pawn;

  private path: string[];
  private timeInCycle: integer = 0;
  private stepDuration: integer = 1000;

  async load(
    targetScene: WorldScene,
    x: integer,
    y: integer,
    spritesheet: string,
    frameHeight: integer,
    frameWidth: integer,
    depth: integer,
    path: string = null,
    collide: "no" | "immovable" | "try" = "no",
    stepDuration: integer,
    movementSpeed: integer
  ) {
    this.stepDuration = stepDuration;
    this.path = (path?.split(",") || []).map((p) => p.trim().toLowerCase());
    this.pawn = await Pawn.createPawn(
      targetScene,
      x,
      y,
      spritesheet,
      frameHeight,
      frameWidth,
      depth,
      collide,
      movementSpeed
    );

    return { shouldUpdate: this.path.length > 0 };
  }
  destroy(): void {
    if (this.staticImage) {
      this.staticImage.destroy();
    } else {
      this.pawn.destroy();
    }
  }
  update(time: number, delta: number) {
    // calculate the current position in the cycle
    this.timeInCycle += delta;
    this.timeInCycle =
      this.timeInCycle % (this.path.length * this.stepDuration);
    const op = this.path[
      Math.floor(this.timeInCycle / this.stepDuration)
    ] as PathOp;

    this.pawn.move(op);
  }
}
