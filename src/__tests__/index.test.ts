import { GameConfig } from '../config';

test('adds 2 + 2 to equal 4, Winston', () => {
  expect(2 + 2).toBe(4);
  expect(GameConfig({gameHeight: 600, gameWidth: 800})).toHaveProperty("height", 600);
});
