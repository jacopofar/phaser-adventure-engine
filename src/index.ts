import 'phaser';
const axios = require('axios').default;

import { PhaserConfig } from './config';

export class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

window.addEventListener('load', async () => {
  try {
    const response = await axios.get('/game/game.json');
    const game = new Game(PhaserConfig(response.data));
  }
  catch(error) {
    window.alert('Error loading game manifest :-(');
    console.error(error)
  }
});
