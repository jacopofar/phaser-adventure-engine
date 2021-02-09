import "phaser";
const axios = require("axios").default;

import { Chunk } from "./chunk";
import { WorldScene } from "../scenes/main-scene";

/**
 * The world properties, using the same names as the Tiled JSON for *.world files
 * when possible.
 */
type WorldProperties = {
  // the filename is a concatenation of these three parts and the X,Y values
  pathPre: string;
  pathMiddle: string;
  pathPost: string;

  multiplierX: integer;
  multiplierY: integer;
  offsetX: integer;
  offsetY: integer;
};

/**
 * Load and unload chunks based on the position.
 *
 */
export class ChunkManager {
  private world: WorldProperties;
  private loadedChunks: Record<string, Chunk> = {};

  private loadDist: integer;
  private unloadDist: integer;

  private latestPosX: integer;
  private latestPosY: integer;
  // don't do a check if the movement is smaller than these pixels
  private reactionDistance: integer;

  constructor(
    loadThreshold: integer = 2000,
    unloadThreshold: integer = 3000,
    reactionDistance: integer = 32
  ) {
    if (unloadThreshold <= loadThreshold) {
      throw Error(
        "Unload threshold should be higher than load one or it will keep loading/unloading the edges"
      );
    }
    this.loadDist = loadThreshold;
    this.unloadDist = unloadThreshold;

    this.reactionDistance = reactionDistance;
  }

  async loadWorld(worldPath: string): Promise<void> {
    const worldData = (await axios.get(worldPath)).data;
    if (worldData.type !== "world") {
      throw Error(
        `This file is not a world file: ${worldPath}. It has no type=world`
      );
    }
    // the world file has a regex with two capturing groups to extract the coordinates from the file names,
    // here we try to find the matches given the X, Y coordinates, which may not be possible because the
    // regex can be ambiguous and many file names may match.
    // however, this in reality should be uncommon, so it's OK
    // also patterns is an array, it's not clear if it can have more than 1 element and what it means
    const { pathPre, pathMiddle, pathPost } = ChunkManager.partsFromRegex(
      worldData.patterns[0].regexp,
      worldPath
    );
    const {
      multiplierX,
      multiplierY,
      offsetX,
      offsetY,
    } = worldData.patterns[0];
    this.world = {
      pathPre,
      pathMiddle,
      pathPost,
      multiplierX,
      multiplierY,
      offsetX,
      offsetY,
    };
    // console.log('World loaded:', this.world);
  }

  async handleNewPosition(targetScene: WorldScene, x: integer, y: integer) {
    if (
      typeof this.latestPosX !== "undefined" &&
      Math.sqrt((this.latestPosX - x) ** 2 + (this.latestPosY - y) ** 2) <
        this.reactionDistance
    ) {
      return;
    } else {
      this.latestPosX = x;
      this.latestPosY = y;
    }
    // console.log('Handling new position, currently loaded:', Object.keys(this.loadedChunks));
    let curChunkX = Math.floor(
      (x - this.world.offsetX) / this.world.multiplierX
    );
    let curChunkY = Math.floor(
      (y - this.world.offsetY) / this.world.multiplierY
    );

    const minloadX = x - this.loadDist;
    const maxloadX = x + this.loadDist;
    const minloadY = y - this.loadDist;
    const maxloadY = y + this.loadDist;

    const minunloadX = x - this.unloadDist;
    const maxunloadX = x + this.unloadDist;
    const minunloadY = y - this.unloadDist;
    const maxunloadY = y + this.unloadDist;
    // how many chunks have to be checked to include the thresholds
    const maxOffset = Math.ceil(
      this.unloadDist / Math.min(this.world.multiplierX, this.world.multiplierY)
    );

    for (let offx = -maxOffset; offx <= maxOffset; offx++) {
      for (let offy = -maxOffset; offy <= maxOffset; offy++) {
        const thisChunk = `${curChunkX + offx}_${curChunkY + offy}`;

        const minChunkX =
          this.world.offsetX + (curChunkX + offx) * this.world.multiplierX;
        const maxChunkX =
          this.world.offsetX + (curChunkX + offx + 1) * this.world.multiplierX;

        const minChunkY =
          this.world.offsetY + (curChunkY + offy) * this.world.multiplierY;
        const maxChunkY =
          this.world.offsetY + (curChunkY + offy + 1) * this.world.multiplierY;

        if (this.loadedChunks.hasOwnProperty(thisChunk)) {
          // loaded, check for unload condition: is it completely outside the unload area?
          if (
            maxunloadX < minChunkX ||
            minunloadX > maxChunkX ||
            maxunloadY < minChunkY ||
            minunloadY > minChunkY
          ) {
            this.loadedChunks[thisChunk].unload();
            delete this.loadedChunks[thisChunk];
          }
        } else {
          // not loaded, should it be? That is, does it intersect the load area?
          if (
            maxloadX >= minChunkX &&
            minloadX <= maxChunkX &&
            minloadY <= maxChunkY &&
            maxloadY >= minChunkY
          ) {
            const newChunk = new Chunk();
            this.loadedChunks[thisChunk] = newChunk;
            await newChunk.loadMap(
              targetScene,
              [
                this.world.pathPre,
                `${curChunkX + offx}`,
                this.world.pathMiddle,
                `${curChunkY + offy}`,
                this.world.pathPost,
              ].join(""),
              minChunkX,
              minChunkY
            );
          }
        }
      }
    }
  }

  update(time: number, delta: number) {
    Object.values(this.loadedChunks).forEach((c) => c.update(time, delta));
  }

  static partsFromRegex(
    regex: string,
    worldPath: string
  ): { pathPre: string; pathMiddle: string; pathPost: string } {
    const worldFolder = worldPath.slice(0, worldPath.lastIndexOf("/") + 1);

    let parts = regex.split(/[\(\)]/);
    if (parts.length !== 5) {
      throw Error(`Invalid regex: ${regex}`);
    }
    parts = parts.map((p) => {
      p = p.replace("\\.", ".");
      return p;
    });

    return {
      pathPre: worldFolder + parts[0],
      pathMiddle: parts[2],
      pathPost: parts[4],
    };
  }
}
