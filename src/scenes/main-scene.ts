import 'phaser';

import { Chunk } from '../tiling/chunk';

export class MainScene extends Phaser.Scene {
  private player: Phaser.Physics.Arcade.Sprite;
  private demo_world: Phaser.Physics.Arcade.Sprite;

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload(): void {
    this.load.spritesheet('player', 'game/sprites/MainGuySpriteSheet.png', { frameWidth: 32, frameHeight: 32 });
  }

  create(): void {
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cameras.main.startFollow(this.player);
    const chunk = new Chunk(this, 'game/maps/first/just_a_chunk.json', 0, 0);

  }

  update(): void {
    if (this.cursors.left.isDown || this.cursors.right.isDown){
      this.player.setVelocityX(this.cursors.left.isDown ? -128 : 128);
    }
    else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown || this.cursors.down.isDown){
      this.player.setVelocityY(this.cursors.up.isDown ? -128 : 128);
    }
    else {
      this.player.setVelocityY(0);
    }
  }
}
