import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { mocked } from 'ts-jest/utils';
import "phaser";

import { Chunk } from "../../maps/chunk";
import { ChunkManager } from "../../maps/chunk_manager";
import { WorldScene } from "../../scenes/main-scene";

const unloadMock = jest.fn();

jest.mock("../../maps/chunk", () => {
  return {
    Chunk: jest.fn().mockImplementation(() => {
      return {
        unload: unloadMock,
        loadMap: jest.fn()
      };
    })
  };
});

describe("ChunkManager regex split", () => {
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
  test("can split a regex into parts", () => {
    expect(
      ChunkManager.partsFromRegex(
        "chunk_(\\-?\\d+)_(\\-?\\d+)\\.json",
        "folder/anotherfolder/world.world"
      )
    ).toStrictEqual({
      pathPre: "folder/anotherfolder/chunk_",
      pathMiddle: "_",
      pathPost: ".json",
    });
  });

  test("can split a regex into parts", () => {
    expect(() =>
      ChunkManager.partsFromRegex(
        "chunk_without_groups\\.json",
        "folder/anotherfolder/world.world"
      )
    ).toThrowError();
  });
});

describe("ChunkManager dynamic retrieval", () => {
  const MockedChunk = mocked(Chunk, true);
  let axiosMock: MockAdapter;
  beforeEach(() => {
    MockedChunk.mockClear();
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

  test("refuses load/unload thresholds that are impossible", () => {
    expect(() => new ChunkManager(30, 20)).toThrowError();
  });

  test("refuses to load a non-world file", async () => {
    axiosMock.onGet("/game/maps/map1/someworld.world").reply(200, {
      bla: 42,
    });
    const cm = new ChunkManager(2000, 3000, 10);
    await expect(
      cm.loadWorld("/game/maps/map1/someworld.world")
    ).rejects.toThrowError();
  });

  test("loads the initial chunks", async () => {

    const addTextMock = jest.fn();
    const scene = {
      add: {
        text: addTextMock
      }
    } as unknown as WorldScene;
    axiosMock.onGet("/game/maps/map1/someworld.world").reply(200, {
      patterns: [
        {
          regexp: "chunk_(\\-?\\d+)_(\\-?\\d+)\\.json",
          multiplierX: 1024,
          multiplierY: 1024,
          offsetX: 0,
          offsetY: 0,
        },
      ],
      type: "world",
    });
    const cm = new ChunkManager(2000, 3000, 10);
    await cm.loadWorld("/game/maps/map1/someworld.world");
    await cm.handleNewPosition(scene, 0, 42);
    // nothing was unloaded
    expect(unloadMock).toHaveBeenCalledTimes(0);
    expect(axiosMock.history.get.length).toBe(1);
    // it loaded the first 16 chunks around the player
    expect(Chunk).toHaveBeenCalledTimes(16);
    // a small movement, should not load anything
    await cm.handleNewPosition(scene, 4, 42);
    expect(Chunk).toHaveBeenCalledTimes(16);
    // bigger movement, load some more (a whole side, so increases by the square root)
    await cm.handleNewPosition(scene, 1000, 42);
    expect(Chunk).toHaveBeenCalledTimes(20);
    // another movement, some chunks get unloaded (again the square root)
    await cm.handleNewPosition(scene as WorldScene, 3020, 42);
    expect(unloadMock).toHaveBeenCalledTimes(4);
  });
});
