//=============================================================================
// BattleUIAdjusters.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Various on/off options for trying to make battles more readable
 * @author Rachnera
 *
 * @param Selected enemy in the foreground
 * @desc Enemy's image + anything on the same layer pushed forward on select
 * @type boolean
 * @default false
 *
 * @help
 * All options are off per default.
 *
 * Enemies' health bars and names are on a different layer from the other
 * enemy-related sprites, which may require further consideration.
 *
 * To only display enemy's names on select:
 * VisuMZ_1_BattleCore -> Enemy Battler Settings -> Name > Name Visibility
 * Turn all options to false save for By Selection?
 */
(() => {
  const params = PluginManager.parameters("BattleUIAdjusters");
  const selectedEnemyInFront = params["Selected enemy in the foreground"];

  const alias_Sprite_Enemy_update = Sprite_Enemy.prototype.update;
  Sprite_Enemy.prototype.update = function () {
    alias_Sprite_Enemy_update.call(this);

    if (!selectedEnemyInFront) {
      return;
    }

    if (!this._battler) {
      return;
    }

    if (this._battler.isSelected() && !this.pushedToForeground) {
      // MZ does not use z-index. Instead, it's the order in which sprites
      // are added to the canvas who's on top.

      const spriteset = SceneManager._scene._spriteset;

      spriteset._enemySprites.forEach((sprite) => spriteset._battleField.removeChild(sprite));

      spriteset._enemySprites.sort((a, b) => {
        if (a === this) {
          return 1;
        }
        if (b === this) {
          return -1;
        }
        return 0;
      });

      spriteset._enemySprites.forEach((sprite) => {
        spriteset._battleField.addChild(sprite);
        sprite.pushedToForeground = sprite === this;
      });
    }
  };
})();
