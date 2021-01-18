const axios = require('axios').default;

let loadedTilesets: Record<string, {name: string, size: integer}>  = {}

export const getTileset = async (targetScene: Phaser.Scene, path: string): Promise<{name: string, size: integer}> => {
  // TODO empty the cache when the scene is destroyed
  // https://photonstorm.github.io/phaser3-docs/Phaser.Scenes.Events.html#event:DESTROY
  if (typeof loadedTilesets[path] !== 'undefined') {
    return loadedTilesets[path];
  }
  const data = (await axios.get(path)).data;
  const imagePath = path.slice(0, path.lastIndexOf('/') + 1) + data.image;

  const frameWidth = Math.floor(data.imagewidth / data.tilewidth);
  const frameHeight = Math.floor(data.imageheight / data.tileheight);


  const p = new Promise<{name: string, size: integer}>((resolve) => {
    targetScene.load.on('complete', () => {
      loadedTilesets[path] = {name: path, size: frameWidth * frameHeight};
      resolve(loadedTilesets[path]);
    })
  });
  targetScene.load.spritesheet(path, imagePath, { frameWidth, frameHeight});
  console.log('Loading tileset', imagePath, 'of size', { frameWidth, frameHeight});
  // so far the request was queued, we need to start the loader
  // https://photonstorm.github.io/phaser3-docs/Phaser.Loader.LoaderPlugin.html
  targetScene.load.start();
  return p;
}
