import "phaser";

import { WorldScene } from "../../scenes/main-scene";
import { DecorativeAgent } from "../decorative_agent";
import { PathOp } from "../pawn";

export async function toast(
  scene: WorldScene,
  aspect: DecorativeAgent,
  duration: number,
  msg: string
) {
  const padding = 10;
  const maxLength = 200;
  // add a "speech bubble" at the current aspect position
  // TODO add a triangle or some way to clarify which sprite owns it
  const txt = scene.add
    .text(aspect.x - maxLength / 2, aspect.y - aspect.height, msg, {
      color: "#000000",
      font: "normal 12pt Arial",
      align: "center",
      wordWrap: {
        width: maxLength,
      },
    })
    // above the graphics
    .setDepth(9000 + 1);

    const graphics = scene.add
    .graphics({
      fillStyle: { color: 0xffffff, alpha: 0.8 },
    })
    .setPosition(txt.x, txt.y)
    .fillRoundedRect(0, 0, txt.width + padding * 2, txt.height + padding * 2, padding)
    .setDepth(9000);

  // subscribe to Pawn movements to move the speech bubble accordingly
  const movementCb = (op: PathOp, x: number, y: number) => {
    graphics.setPosition(x - txt.width / 2 - padding, y - aspect.height * 1.5 - padding);
    txt.setPosition(x - txt.width / 2, y - aspect.height * 1.5);
  };
  const destroyToast = () => {
    graphics.destroy();
    txt.destroy();
    aspect.removeMoveListener(movementCb);
  };
  aspect.addMoveListener(movementCb);
  // destroy the speech bubble when the time is up
  setTimeout(destroyToast, 1000 * duration);

  // or when the Pawn is destroyed
  aspect.onDestroy(destroyToast);
}
