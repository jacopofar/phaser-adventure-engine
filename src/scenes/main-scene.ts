import 'phaser';

import { ChunkManager } from '../tiling/chunk_manager';

export class MainScene extends Phaser.Scene {
  private player: Phaser.Physics.Arcade.Sprite;
  private demo_world: Phaser.Physics.Arcade.Sprite;

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  private chunkManager: ChunkManager;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload(): void {
    this.load.spritesheet('player', 'game/sprites/MainGuySpriteSheet.png', { frameWidth: 32, frameHeight: 32 });
  }

  async create(): Promise<void> {
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setDepth(1);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cameras.main.startFollow(this.player);
    // const chunk = new Chunk(this, 'game/maps/second/chunk_0_0.json', 0, 0);
    this.chunkManager = new ChunkManager();
    await this.chunkManager.loadWorld('game/maps/second/world.world');
  }

  async update(): Promise<void> {
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
    this.chunkManager.handleNewPosition(this, this.player.x, this.player.y);
  }
}
