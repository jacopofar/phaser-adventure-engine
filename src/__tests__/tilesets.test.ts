import moxios from 'moxios';
import 'phaser';
const { createCanvas } = require('canvas');

import { getTileset } from '../tiling/tilesets';


describe('Tileset retrieval', () => {
  beforeEach(() => moxios.install());
  afterEach(() => moxios.uninstall());

  test('retrieves a tileset', async () => {
    const loader = {
      on: jest.fn<Phaser.Loader.LoaderPlugin, [string, Function]>((evtype, f) => {
        if (evtype == 'complete') {
          setImmediate(() => f());
        }
        return null as Phaser.Loader.LoaderPlugin;
      }),
      spritesheet: jest.fn<Phaser.Loader.LoaderPlugin, [any]>((i) => {
        return null as Phaser.Loader.LoaderPlugin;
      }),
      start: jest.fn<Phaser.Loader.LoaderPlugin, [any]>((i) => {
        return null as Phaser.Loader.LoaderPlugin;
      })
    };

    moxios.wait(() => {
      let request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: {e : 42},
      });
    });
    // this double casting is necessary to create a fake loader without mocking the whole galaxy
    // but still having TS accept it
    await getTileset(loader as unknown as Phaser.Loader.LoaderPlugin, '/hello/folder1/tileset_name.json');
    expect(moxios.requests.mostRecent().url).toBe('/hello/folder1/tileset_name.json');

  });
});
