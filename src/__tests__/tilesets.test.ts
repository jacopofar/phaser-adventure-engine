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
        response: {
          image: "image_name.png",
          tileheight: 32,
          tilewidth: 32,
          someProperty: 42,
          imageheight: 512,
          imagewidth: 512
        },
      });
    });
    // this double casting is necessary to create a fake loader without mocking the whole galaxy
    // but still having TS accept it
    await getTileset(loader as unknown as Phaser.Loader.LoaderPlugin, '/hello/folder1/tileset_name.json');
    expect(moxios.requests.mostRecent().url).toBe('/hello/folder1/tileset_name.json');
    // requested a single spritesheet
    expect(loader.spritesheet.mock.calls.length).toBe(1);
    expect(loader.spritesheet.mock.calls[0]).toEqual([
      "/hello/folder1/tileset_name.json",
      "/hello/folder1/image_name.png",
      {"frameHeight": 32, "frameWidth": 32}
    ]);
    // triggered the load queue start
    expect(loader.start.mock.calls.length).toBe(1);
  });
  //TODO:
  // check the case of missing tileset JSON and associated error
});
