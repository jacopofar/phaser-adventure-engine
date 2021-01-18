import { PhaserConfig } from '../config';

test('PhaserConfig is created with the properties from the object', () => {
  expect(PhaserConfig({gameHeight: 600, gameWidth: 800})).toHaveProperty("height", 600);
});
