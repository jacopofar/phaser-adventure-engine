import 'phaser';
const axios = require('axios').default;

import { getTileset } from './tilesets';

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
  private sprites: (Phaser.GameObjects.Image | Phaser.GameObjects.Text)[] = [];

  private async getTilesIndexes(loader: Phaser.Loader.LoaderPlugin, mapPath: string, tilesets: TilesetData[]): Promise<Record<number, [string, number]>> {
    // TODO: often they'll be the same for many chunks, so
    // could be cached? Tricky because the tileset has to remain valid in Phaser
    let transl: Record<integer, [string, integer]> = {};
    const base = mapPath.slice(0, mapPath.lastIndexOf('/') + 1);
    for(let tileset of tilesets) {
      let spritesheet = await getTileset(loader, base + tileset.source);
      for (let i=0; i < spritesheet.size; i++) {
        transl[tileset.firstgid + i] = [spritesheet.name, i];
      }
    }
    return transl;
  }

  async loadMap (targetScene: Phaser.Scene, mapPath: string, x: integer, y: integer): Promise<void> {
    // console.log('Loading chunk at ', mapPath, ' for coords', x, ' ', y);
    let mapData;
    try {
      mapData = (await axios.get(mapPath)).data;
    } catch {
      for (let k=0; k < 10; k++){
        this.sprites.push(targetScene.add.text(
          x + k * 32,
          y + k * 32,
          `Map not found: ${mapPath}`,
          { color: ['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff'][k % 5] }
          ));
      }
      return;
    }
    // TODO here would be nice to check for the map format
    // (e.g. is it orthogonal? compressed? wrong renderorder?) and raise clear errors if needed
    // this could be useful: https://github.com/gcanti/io-ts
    const {height, width, tilewidth, tileheight} = mapData;

    // first step: load all the tilesets and calculate their map ids
    // note: this also loads the tilesets in the Phaser scene if not there already
    const transl = await this.getTilesIndexes(targetScene.load, mapPath, mapData.tilesets);

    // second step: load the layers using the mapping above
    let layerDepth = - Math.floor(mapData.layers.length / 2);
    for(let layer of mapData.layers) {
      layerDepth += 1;
      // console.log('Drawing layer at depth', layerDepth * 10);
      if (layer.type !== "tilelayer") {
        continue;
      }
      // TODO how to implement the Z-ordering? Is it based only on layer order? For now seems OK
      for(let idx=0; idx < layer.data.length; idx++) {
        const tid: integer = layer.data[idx];
        if (tid === 0){
          // empty
          continue;
        }
        const tile = transl[tid];
        const tx = x + (idx % width) * tilewidth;
        const ty = y + Math.floor(idx / height) * tileheight;
        const img = targetScene.add.image(tx, ty, tile[0], tile[1]);
        // multiplied by 10 to allow intermediate levels to be added more easily as if it was BASIC
        img.setDepth(layerDepth * 10);
        // reference to the sprites for later deletion
        this.sprites.push(img);
      }
    }
  };

  unload() {
    this.sprites.forEach(s => s.destroy());
    this.sprites = [];
  };
}
