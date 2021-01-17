export class MainScene extends Phaser.Scene {
  private player: Phaser.Physics.Arcade.Sprite;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload(): void {
    this.load.spritesheet('player', 'assets/sprites/MainGuySpriteSheet.png', { frameWidth: 32, frameHeight: 32 });
  }

  create(): void {
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update(): void {
    if (this.cursors.left.isDown || this.cursors.right.isDown){
      this.player.setVelocityX(this.cursors.left.isDown ? -100 : 100);
    }
    else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown || this.cursors.down.isDown){
      this.player.setVelocityY(this.cursors.up.isDown ? -100 : 100);
    }
    else {
      this.player.setVelocityY(0);
    }
  }
}
