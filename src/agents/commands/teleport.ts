import { WorldScene } from "../../scenes/main-scene";

export async function teleport(
  scene: WorldScene,
  map: string,
  x: integer,
  y: integer
) {
  await scene.teleport(map, x, y);
}
