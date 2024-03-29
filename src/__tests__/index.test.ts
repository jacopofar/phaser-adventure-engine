import { PhaserConfig } from "../config";

test("PhaserConfig is created with the properties from the object", () => {
  expect(
    PhaserConfig({
      gameScreenHeight: 600,
      gameScreenWidth: 800,
      playerSpritesheet: "meh",
      gameTitle: "some game name",
      startX: 9000,
      startY: -800,
      initialWorld: "some/world.world",
    })
  ).toHaveProperty("height", 600);
});
