import { ChunkManager } from '../tiling/chunk_manager';

describe('ChunkManager regex split', () => {
  test('can split a regex into parts', () => {
    expect(
      ChunkManager.partsFromRegex("chunk_(\\-?\\d+)_(\\-?\\d+)\\.json", "folder/anotherfolder/world.world")
    ).toStrictEqual({
      pathPre: "folder/anotherfolder/chunk_",
      pathMiddle: "_",
      pathPost: ".json"
    });
  });

  test('can split a regex into parts', () => {
    expect(
      () => ChunkManager.partsFromRegex("chunk_without_groups\\.json", "folder/anotherfolder/world.world")
    ).toThrowError();
  });
});
