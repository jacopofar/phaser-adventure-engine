# Purpose of the dependencies

Since dependencies tend to explode, or remain when not needed this document tries to explain the purpose of each one fo them in this project.

## Build dependencies
These are needed to run the actual content, and go to the user browser.
For this reason it's important to be very careful about the size.

* Phaser: the game library to do pretty much everything
* Axios: to make HTTP requests nicely

## Dev dependencies
These are used to develop and test the application.

* @types/jest: typescript types for Jest tests
* canvas: necessary to test code using canvas under jsdom
* copy-webpack-plugin: copies files as-is from the game folder to the dist
* html-webpack-plugin: generates the HTML for the page on the fly
* jest: run tests
* ts-jest: Jest integration with TypeScript
* ts-loader: allows Jest tests to transpile test anbd handle imports
* typescript: Typescript of course
* webpack: build the project, handling assets, transpiling and whatnot
* webpack-cli: necessary to invoke the build steps from the tasks in package.json
* webpack-dev-server: runs an HTTP server with automatic reload upon changes
