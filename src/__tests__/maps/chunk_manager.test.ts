import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import "phaser";
import { Chunk } from "../../maps/chunk";
import { ChunkManager } from "../../maps/chunk_manager";
import { WorldScene } from "../../scenes/main-scene";

jest.mock("../../maps/chunk");

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
    const scene = {};
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
    await cm.handleNewPosition(scene as WorldScene, 0, 42);
    expect(axiosMock.history.get.length).toBe(1);
    // it loaded the first 9 chunks around the player
    expect(Chunk).toHaveBeenCalledTimes(9);
    // a small movement, should not load anything
    await cm.handleNewPosition(scene as WorldScene, 4, 42);
    expect(Chunk).toHaveBeenCalledTimes(9);
    // bigger movement, load some more
    await cm.handleNewPosition(scene as WorldScene, 1000, 42);
    expect(Chunk).toHaveBeenCalledTimes(9);
  });
});