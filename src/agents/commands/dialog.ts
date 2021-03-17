import { WorldScene } from "../../scenes/main-scene";
// TODO: This should be used instead https://rexrainbow.github.io/phaser3-rex-notes/docs/site/texttyping/
// also look at the types: https://github.com/khasanovbi/phaser3-rex-plugins-types
export function say(scene: WorldScene, msgs: string | string[]): Promise<void> {
  scene.ignoreInput(true);
  const scrOrigin = scene.cameras.main.worldView;
  const g = scene.add.graphics({
    fillStyle: { color: 0xffffff },
  });

  const padding = 20;
  g.lineStyle(5, 0x101010);
  g.strokeRect(
    scrOrigin.x + padding,
    scrOrigin.y + scrOrigin.height / 2,
    scrOrigin.width - padding * 2,
    scrOrigin.height / 2 - padding
  );
  g.fillRect(
    scrOrigin.x + padding,
    scrOrigin.y + scrOrigin.height / 2,
    scrOrigin.width - padding * 2,
    scrOrigin.height / 2 - padding
  );
  const txt = scene.add.text(
    scrOrigin.x + padding * 2,
    scrOrigin.y + scrOrigin.height / 2 + padding,
    msgs,
    {
      color: "#000000",
      //font: "bold 60pt Arial",
      align: "left",
      wordWrap: {
        width: scrOrigin.width - padding * 4,
      },
    }
  );
  txt.setScrollFactor(1);
  g.setScrollFactor(1);
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
    }, 50);
  });
}
