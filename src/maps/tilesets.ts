import { resolvePath } from "../utils";
const axios = require("axios").default;

type TilesProperties = Record<integer, { collide?: boolean }>;

let loadedTilesets: Record<
  string,
  { name: string; size: integer; properties: TilesProperties }
> = {};

export const getTileset = async (
  loader: Phaser.Loader.LoaderPlugin,
  path: string
): Promise<{ name: string; size: integer; properties: TilesProperties }> => {
  // TODO empty the cache when the scene is destroyed
  // https://photonstorm.github.io/phaser3-docs/Phaser.Scenes.Events.html#event:DESTROY
  if (typeof loadedTilesets[path] !== "undefined") {
    return loadedTilesets[path];
  }
  const data = (await axios.get(path)).data;
  const imagePath = resolvePath(path, data.image);

  const size = Math.floor(
    ((data.imagewidth / data.tilewidth) * data.imageheight) / data.tileheight
  );

  const properties: TilesProperties = {};
  // if the tileset has tile properties, load them
  if (data.tileproperties) {
    Object.entries(data.tileproperties).forEach(([tid, props]) => {
      if (props.hasOwnProperty("collide")) {
        properties[Number(tid)] = {
          // meh. The condition in the if is not a guard
          // the type here is not exact, too, there could be other properties
          collide: (props as { collide: boolean }).collide,
        };
      }
    });
  }

  const p = new Promise<{
    name: string;
    size: integer;
    properties: TilesProperties;
  }>((resolve, reject) => {
    loader.on("complete", () => {
      loadedTilesets[path] = { name: path, size, properties };
      resolve(loadedTilesets[path]);
    });
    loader.on("loaderror", (error: Phaser.Loader.File) => {
      reject(error);
    });
  });
  loader.spritesheet(path, imagePath, {
    frameWidth: data.tilewidth,
    frameHeight: data.tileheight,
  });
  // console.log('Loading tileset', imagePath, 'of size', size);
  // so far the request was queued, we need to start the loader
  // https://photonstorm.github.io/phaser3-docs/Phaser.Loader.LoaderPlugin.html
  loader.start();
  return p;
};
