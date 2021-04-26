let loadeSpritesheets: Record<string, { name: string }> = {};

export const getSpritesheet = async (
  loader: Phaser.Loader.LoaderPlugin,
  path: string,
  tileWidth: integer,
  tileHeight: integer
): Promise<{ name: string }> => {
  // TODO empty the cache when the scene is destroyed
  // https://photonstorm.github.io/phaser3-docs/Phaser.Scenes.Events.html#event:DESTROY
  if (typeof loadeSpritesheets[path] !== "undefined") {
    return loadeSpritesheets[path];
  }

  const p = new Promise<{
    name: string;
  }>((resolve, reject) => {
    loader.on("complete", () => {
      loadeSpritesheets[path] = { name: path };
      resolve(loadeSpritesheets[path]);
    });
    loader.on("loaderror", (error: Phaser.Loader.File) => {
      reject(error);
    });
  });
  loader.spritesheet(path, path, {
    frameWidth: tileWidth,
    frameHeight: tileHeight,
  });
  // so far the request was queued, we need to start the loader
  // https://photonstorm.github.io/phaser3-docs/Phaser.Loader.LoaderPlugin.html
  loader.start();
  return p;
};
