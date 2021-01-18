import { GameConfig } from '../config';

test('GameConfig is created with the properties from the object', () => {
  expect(GameConfig({gameHeight: 600, gameWidth: 800})).toHaveProperty("height", 600);
});
