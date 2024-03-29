import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { Chunk } from "../../maps/chunk";
import { getTileset } from "../../maps/tilesets";
import { WorldScene } from "../../scenes/main-scene";

jest.mock("../../maps/tilesets");

describe("Single chunk retrieval", () => {
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

  test("loads a map", async () => {
    axiosMock.onGet("/game/maps/map1/chunk_1_-4.json").reply(200, {
      answer: 42,
    });
    axiosMock.onGet("/game/maps/map1/chunk_1_-4.json").reply(200, {
      height: 15,
      width: 64,
      tileheight: 32,
      tilewidth: 32,
      tilesets: [
        {
          firstgid: 1,
          source: "some-tileset.json",
        },
        {
          firstgid: 1000,
          source: "some-other-tileset.json",
        },
      ],
      layers: [
        {
          type: "something else",
          blip: "blop",
        },
        {
          type: "tilelayer",
          data: [0, 0, 0, 23, 0, 134],
        },
        {
          type: "tilelayer",
          data: [0, 0, 0, 0, 1003, 3],
        },
      ],
    });
    const mockedGetTileset = getTileset as jest.Mock;
    mockedGetTileset.mockImplementation(async (s, path: string) => {
      return { name: path, size: 200 + path.length, properties: {} };
    });
    const mockAddImage = jest.fn();
    const setDepth = jest.fn();
    mockAddImage.mockReturnValue({ setDepth });
    const mockAddObstacle = jest.fn();
    mockAddObstacle.mockReturnValue({ setDepth });

    const scene = ({
      load: "a fake loader",
      add: {
        image: mockAddImage,
      },
      addObstacle: mockAddObstacle,
    } as unknown) as WorldScene;

    const c = new Chunk();
    await c.loadMap(scene, "/game/maps/map1/chunk_1_-4.json", -10, 42);
    expect(axiosMock.history.get[0].url).toBe(
      "/game/maps/map1/chunk_1_-4.json"
    );
    expect(mockedGetTileset.mock.calls).toEqual([
      ["a fake loader", "/game/maps/map1/some-tileset.json"],
      ["a fake loader", "/game/maps/map1/some-other-tileset.json"],
    ]);
    // the order is layer by layer and tile by tile
    expect(mockAddImage.mock.calls).toEqual([
      [86, 42, "/game/maps/map1/some-tileset.json", 22],
      [150, 42, "/game/maps/map1/some-tileset.json", 133],
      [118, 42, "/game/maps/map1/some-other-tileset.json", 3],
      [150, 42, "/game/maps/map1/some-tileset.json", 2],
    ]);
    expect(setDepth.mock.calls).toEqual([[10], [10], [20], [20]]);
  });

  test("shows placehoplder when a map is missing", async () => {
    axiosMock.onGet("/game/maps/map1/chunk_1_-4.json").reply(404);
    const mockAddImage = jest.fn();
    const mockAddText = jest.fn();
    const mockAddObstacle = jest.fn();

    const scene = ({
      load: "a fake loader",
      add: {
        image: mockAddImage,
        text: mockAddText,
      },
      addObstacle: mockAddObstacle,
    } as unknown) as WorldScene;

    const c = new Chunk();
    await c.loadMap(scene, "/game/maps/map1/chunk_1_-4.json", -10, 42);
    expect(axiosMock.history.get[0].url).toBe(
      "/game/maps/map1/chunk_1_-4.json"
    );

    // no sprites were added
    expect(mockAddImage.mock.calls).toEqual([]);
    // but warning text was, how many times is not important
    expect(mockAddText.mock.calls.length).toBeGreaterThan(0);
  });
});
