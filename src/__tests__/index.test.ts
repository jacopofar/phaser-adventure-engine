import { PhaserConfig } from "../config";

test("PhaserConfig is created with the properties from the object", () => {
  expect(
    PhaserConfig({
      gameHeight: 600,
      gameWidth: 800,
      playerSpritesheet: "meh",
      gameTitle: "some game name",
    })
  ).toHaveProperty("height", 600);
});
