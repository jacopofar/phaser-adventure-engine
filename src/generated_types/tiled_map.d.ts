/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface TiledMap {
  height: number;
  width: number;
  tilewidth: number;
  tileheight: number;
  layers: (
    | {
        data?: number[];
        type?: "tilelayer";
        [k: string]: unknown;
      }
    | {
        objects?: {
          x?: number;
          y?: number;
          properties?: {
            [k: string]: unknown;
          };
          [k: string]: unknown;
        }[];
        type?: "objectgroup";
        [k: string]: unknown;
      }
  )[];
  tilesets: {
    firstgid: number;
    source: string;
  }[];
  [k: string]: unknown;
}
