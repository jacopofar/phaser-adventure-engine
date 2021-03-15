import { WorldScene } from "../scenes/main-scene";
import { Pawn, PawnConfig } from "./pawn";

type PathOp = "up" | "down" | "right" | "left" | "idle";
export interface DecorativeAgentConfig extends PawnConfig {
  stepDuration: integer;
  path: string;
}
/**
 * An agent without interaction, it moves following a path or stands still.
 */
export class DecorativeAgent {
  private staticImage: Phaser.GameObjects.Image;
  private pawn: Pawn;
  private path: string[];
  private timeInCycle: integer = 0;
  private stepDuration: integer = 1000;

  async load(targetScene: WorldScene, config: DecorativeAgentConfig) {
    this.stepDuration = config.stepDuration;
    this.path = (config.path?.split(",") || []).map((p) =>
      p.trim().toLowerCase()
    );
    this.pawn = await Pawn.createPawn(targetScene, config);

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
  onCollide(cb: (other: any) => void) {
    this.pawn.onCollide(cb);
  }
}
