import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import "phaser";

import { getTileset } from "../../maps/tilesets";

describe("Tileset retrieval", () => {
  let axiosMock: MockAdapter;
  beforeEach(() => {
    axiosMock = new MockAdapter(axios);
  });
  afterEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
  });
  afterAll(() => {
    axiosMock.restore();
  });
  afterEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
  });

  test("retrieves a tileset", async () => {
    const loader = {
      on: jest.fn<Phaser.Loader.LoaderPlugin, [string, Function]>(
        (evtype, f) => {
          if (evtype == "complete") {
            setImmediate(() => f());
          }
          return null as Phaser.Loader.LoaderPlugin;
        }
      ),
      spritesheet: jest.fn<Phaser.Loader.LoaderPlugin, [any]>((i) => {
        return null as Phaser.Loader.LoaderPlugin;
      }),
      start: jest.fn<Phaser.Loader.LoaderPlugin, [any]>((i) => {
        return null as Phaser.Loader.LoaderPlugin;
      }),
    };
    axiosMock.onGet("/hello/folder1/tileset_name.json").reply(200, {
      image: "image_name.png",
      tileheight: 32,
      tilewidth: 32,
      someProperty: 42,
      imageheight: 512,
      imagewidth: 512,
      tileproperties: {
        "5": {
          collide: true,
          ble: 42,
        },
        "7": {
          unrelated: false,
        },
      },
    });
    // this double casting is necessary to create a fake loader without mocking the whole galaxy
    // but still having TS accept it
    await getTileset(
      (loader as unknown) as Phaser.Loader.LoaderPlugin,
      "/hello/folder1/tileset_name.json"
    );
    // this is not really necessary because the mock is targeted at this URL
    // but is better to be explicit in case of future changes
    expect(axiosMock.history.get[0].url).toBe(
      "/hello/folder1/tileset_name.json"
    );
    // requested a single spritesheet
    expect(loader.spritesheet.mock.calls.length).toBe(1);
    expect(loader.spritesheet.mock.calls[0]).toEqual([
      "/hello/folder1/tileset_name.json",
      "/hello/folder1/image_name.png",
      { frameHeight: 32, frameWidth: 32 },
    ]);
    // triggered the load queue start
    expect(loader.start.mock.calls.length).toBe(1);
  });
  //TODO:
  // check the case of missing tileset JSON and associated error
});
