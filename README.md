## A game

A better title will come later maybe.

This project defines an engine to run an adventure game in the browser, and implements a game with it.

The game and the engine are kept separated, the game is in the _game\_\_ folder, the "engine", based on Phaser.js, is in the \_src_ folder. By replacing the game folder with another one, you can run another game. This is to later allow game generation using external scripts, or a backend to deliver generated content.

## Run locally

Use `yarn install` and then `yarn run dev-serve` to run a local server that will compile and reload on change.

## Dependencies

You can look at [dependencies_reason.md](dependencies_reason.md) for an explanation about what and why is needed in the project.

## Schemas

The schemas under the schemas folder are used both to validate the files for a project and to generate the Typescript types.
Use `yarn generate-types-from-jsonschema` to regenerate the type files under `src/generated_types`
