import { WorldScene } from "../../scenes/main-scene";
// TODO: This should be used instead https://rexrainbow.github.io/phaser3-rex-notes/docs/site/texttyping/
// also look at the types: https://github.com/khasanovbi/phaser3-rex-plugins-types
export function say(scene: WorldScene, msgs: string | string[]): Promise<void> {
  scene.ignoreInput(true);
  const scrOrigin = scene.cameras.main.getWorldPoint(0, 0);
  const g = scene.add.graphics({
    lineStyle: { width: 10, color: 0x000000 },
    fillStyle: { color: 0xffffff },
  });
  const padding = 20;
  g.fillRect(
    scrOrigin.x + padding,
    scrOrigin.y + scene.cameras.main.height / 2,
    scene.cameras.main.width - padding * 2,
    scene.cameras.main.height / 2 - padding
  );
  const txt = scene.add.text(
    scrOrigin.x + padding * 2,
    scrOrigin.y + scene.cameras.main.height / 2 + padding,
    msgs,
    {
      color: "#000000",
      //font: "bold 60pt Arial",
      align: "left",
      wordWrap: {
        width: scene.cameras.main.width - padding * 4,
      },
    }
  );
  g.setScrollFactor(0);
  txt.setScrollFactor(0);
  g.depth = 8999;
  txt.depth = 9000;
  let txtIdx = 0;

  const realText = typeof msgs == "string" ? msgs : msgs.join("\n");
  return new Promise<void>((resolve, reject) => {
    const handler = setInterval(() => {
      txtIdx++;
      txt.text = realText.substr(0, txtIdx);
      if (txtIdx > realText.length) {
        clearInterval(handler);
        scene.ignoreInput(false);
        txt.destroy();
        g.destroy();
        resolve();
      }
    }, 20);
  });
}
