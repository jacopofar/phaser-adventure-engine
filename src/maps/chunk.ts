import "phaser";
const axios = require("axios").default;

import { AdventureData } from "../index";
import { getTileset } from "./tilesets";
import { WorldScene } from "../scenes/main-scene";
import { DecorativeAgent } from "../agents/decorative_agent";
import { FullAgent } from "../agents/full_agent";

/**
 * The map properties, using the same names as the Tiled JSON
 */
type TilesetData = {
  firstgid: integer;
  source: string;
};
interface updatable {
  update(time: number, delta: number): void;
}

type ShownElement =
  | Phaser.GameObjects.Image
  | Phaser.GameObjects.Text
  | Phaser.Types.Physics.Arcade.SpriteWithStaticBody;

/**
 * An helper class to handle a chunk of tiles in a map.
 *
 * A chunk is a portion of the map small enough to easily fit in memory.
 */
export class Chunk {
  private sprites: ShownElement[] = [];
  private agents: DecorativeAgent[] = [];
  private toUpdate: updatable[] = [];
  private mapPath: string;

  /**
   * Load a list of Tiled tilesets, make them available as Phaser spritesheets and
   * returns the mapping between the map tile index and the corresponding spritesheet index.
   *
   * Additionally, return the collision property of the tiles.
   */
  private async retrieveTileset(
    loader: Phaser.Loader.LoaderPlugin,
    basePath: string,
    tilesets: TilesetData[]
  ): Promise<
    Record<number, { sheet: string; frame: integer; collide?: boolean }>
  > {
    // TODO: often they'll be the same for many chunks, so
    // could be cached? Tricky because the tileset has to remain valid in Phaser
    let transl: Record<
      integer,
      { sheet: string; frame: integer; collide?: boolean }
    > = {};
    for (let tileset of tilesets) {
      let spritesheet = await getTileset(loader, basePath + tileset.source);
      for (let i = 0; i < spritesheet.size; i++) {
        transl[tileset.firstgid + i] = {
          sheet: spritesheet.name,
          frame: i,
          collide: spritesheet.properties[i]?.collide,
        };
      }
    }
    return transl;
  }

  async loadMap(
    targetScene: WorldScene,
    mapPath: string,
    x: integer,
    y: integer
  ): Promise<void> {
    // console.log('Loading chunk at ', mapPath, ' for coords', x, ' ', y);
    let mapData;
    try {
      mapData = (await axios.get(mapPath)).data;
      this.mapPath = mapPath;
    } catch {
      for (let k = 0; k < 10; k++) {
        this.sprites.push(
          targetScene.add.text(
            x + k * 32,
            y + k * 32,
            `Map not found: ${mapPath}`,
            {
              color: ["#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff"][
                k % 5
              ],
            }
          )
        );
      }
      return;
    }
    // TODO here would be nice to check for the map format
    // (e.g. is it orthogonal? compressed? wrong renderorder?) and raise clear errors if needed
    // this could be useful: https://github.com/gcanti/io-ts
    const { height, width, tilewidth, tileheight } = mapData;
    const basePath = mapPath.slice(0, mapPath.lastIndexOf("/") + 1);

    // first step: load all the tilesets and calculate their map ids
    // note: this also loads the tilesets in the Phaser scene if not there already
    const transl = await this.retrieveTileset(
      targetScene.load,
      basePath,
      mapData.tilesets
    );

    // second step: load the layers using the mapping above
    let layerDepth = -Math.floor(mapData.layers.length / 2);
    for (let layer of mapData.layers) {
      layerDepth += 1;
      // console.log('Drawing layer at depth', layerDepth * 10);
      if (layer.type === "objectgroup") {
        const adventureData = AdventureData.getGameData(targetScene);
        // TODO define a schema and checks for the object
        layer.objects.forEach(async (obj: any) => {
          // if it has a spritesheet, it's the simplest type of agent, a decorative one
          if (typeof obj.properties?.spritesheet !== "undefined") {
            const as = new DecorativeAgent();
            this.agents.push(as);

            const { shouldUpdate } = await as.load(
              targetScene,
              obj.x + x,
              obj.y + y,
              basePath + obj.properties.spritesheet,
              obj.properties.frameHeight || adventureData.tileHeightDefault,
              obj.properties.frameWidth || adventureData.tileWidthDefault,
              layerDepth * 10,
              false,
              null,
              obj.properties.path,
              obj.properties.collide || "no",
              obj.properties.stepDuration || 1000,
              obj.properties.movementSpeed || 100
            );
            if (shouldUpdate) {
              this.toUpdate.push(as);
            }
          }
          // there's a JSON property, create the "full" agent
          if (typeof obj.properties?.agent !== "undefined") {
            // the object can have an agent_id string, otherwise the map and id are concatenated
            const agentId: string = obj.properties.agent_id || (this.mapPath + "_" + obj.id);
            const agentConfig = (await axios.get(basePath + obj.properties.agent)).data;
            const fa = new FullAgent(agentId, agentConfig);
            const { shouldUpdate } = await fa.load();
            if (shouldUpdate) {
              this.toUpdate.push(fa);
            }
          }
        });
      }
      if (layer.type !== "tilelayer") {
        continue;
      }
      // TODO how to implement the Z-ordering? Is it based only on layer order? For now seems OK
      for (let idx = 0; idx < layer.data.length; idx++) {
        const tid: integer = layer.data[idx];
        if (tid === 0) {
          // empty
          continue;
        }
        const tile = transl[tid];
        const tx = x + (idx % width) * tilewidth;
        const ty = y + Math.floor(idx / height) * tileheight;
        let img: ShownElement;
        if (tile.collide) {
          img = targetScene.addObstacle(tx, ty, tile.sheet, tile.frame);
        } else {
          img = targetScene.add.image(tx, ty, tile.sheet, tile.frame);
        }
        // multiplied by 10 to allow intermediate levels to be added more easily as if it was BASIC
        img.setDepth(layerDepth * 10);
        // reference to the sprites for later deletion
        this.sprites.push(img);
      }
    }
  }

  unload() {
    this.sprites.forEach((s) => s.destroy());
    this.sprites = [];
    this.agents.forEach((a) => a.destroy());
    this.agents = [];

    this.toUpdate = [];
  }
  update(time: number, delta: number) {
    this.toUpdate.forEach((t) => t.update(time, delta));
  }
}
