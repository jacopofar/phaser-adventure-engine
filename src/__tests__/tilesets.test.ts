import moxios from 'moxios';
import 'phaser';
const { createCanvas } = require('canvas');

import { getTileset } from '../tiling/tilesets';


describe('Tileset retrieval', () => {
  beforeEach(() => moxios.install());
  afterEach(() => moxios.uninstall());

  test('retrieves a tileset', async () => {
    const game = new Phaser.Game({
      disableContextMenu: true,
      type: Phaser.HEADLESS,
      width: 800,
      height: 600,
      scene: [{
        preload: () => { console.log('server preload') },
        create: () => { console.log('server create') },
        update: () => { console.log('server update') }
      }]
    });
    const loader = new Phaser.Loader.LoaderPlugin(game.scene.getAt(0));

    jest.spyOn(loader, 'on')
    .mockImplementation(() => loader);

    try {
      moxios.wait(() => {
        let request = moxios.requests.mostRecent();
        request.respondWith({
          status: 200,
          response: {e : 42},
        });
      });
      await getTileset(loader, '/hello/folder1/tileset_name.json');
      expect(moxios.requests.mostRecent().url).toBe('ccc');
    }
    catch(e) {
      expect(e).toBe(34);
    }
  });
});
