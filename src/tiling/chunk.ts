import 'phaser';
const axios = require('axios').default;

import { getTileset } from './tilesets'

/**
 * The map properties, using the same names as the Tiled JSON
*/
type ChunkProperties = {
  height: integer;
  width: integer;
  tilewidth: integer;
  tileheight: integer;
};

/**
 * The map properties, using the same names as the Tiled JSON
*/
type TilesetData = {
  firstgid: integer;
  source: string;
};


/**
 * An helper class to handle a chunk of tiles in a map.
 *
 * A chunk is a portion of the map small enough to easily fit in memory.
 */
export class Chunk {
  private properties: ChunkProperties;
  private sprites: Phaser.GameObjects.Image[] = [];


  constructor(targetScene: Phaser.Scene, mapPath: string, x: integer, y: integer) {
    this.loadMap(targetScene, mapPath, x, y);
  }

  private getTilesIndexes = async(targetScene: Phaser.Scene, mapPath: string, tilesets: TilesetData[]): Promise<Record<number, [string, number]>> => {
    // TODO: often they'll be the same for many chunks, so
    // could be cached? Tricky because the tileset has to remain valid in Phaser
    let transl: Record<integer, [string, integer]> = {};
    const base = mapPath.slice(0, mapPath.lastIndexOf('/') + 1);
    for(let tileset of tilesets) {
      let spritesheet = await getTileset(targetScene, base + tileset.source);
      for (let i=0; i < spritesheet.size; i++) {
        transl[tileset.firstgid + i] = [spritesheet.name, i];
      }
    }
    return transl;
  }

  loadMap = async (targetScene: Phaser.Scene, mapPath: string, x: integer, y: integer): Promise<void> => {
    const mapData = (await axios.get(mapPath)).data;
    // TODO here would be nice to check for the map format
    // (e.g. is it orthogonal? compressed? wrong renderorder?) and raise clear errors if needed
    // this could be useful: https://github.com/gcanti/io-ts
    const {height, width, tilewidth, tileheight} = mapData;
    this.properties = {height, width, tilewidth, tileheight};

    // first step: load all the tilesets and calculate their map ids
    // note: this loads the tilesets in the Phaser scene if not there already
    const transl = await this.getTilesIndexes(targetScene, mapPath, mapData.tilesets);

    // second step: load the layers using the mapping above
    for(let layer of mapData.layers) {
      if (layer.type !== "tilelayer") {
        continue;
      }
      // TODO how to implement the Z-ordering? Is it based only on layer order?
      for(let idx=0; idx < layer.data.length; idx++) {
        const tid: integer = layer.data[idx];
        if (tid === 0){
          // empty
          continue;
        }
        const tile = transl[tid];
        const tx = x + (idx % width) * tilewidth;
        const ty = x + Math.floor(idx / height) * tileheight;

        this.sprites.push(targetScene.add.image(tx, ty, tile[0], tile[1]))
      }
    }
    // now all sprites are shown, and a reference to them is kept in this.sprites for later deletion
  }
}
