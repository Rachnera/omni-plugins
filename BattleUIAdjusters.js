//=============================================================================
// BattleUIAdjusters.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Various options for trying to make battles more readable
 * @author Rachnera
 *
 * @param Selected enemy in the foreground
 * @desc Enemy's image + anything on the same layer pushed forward on select
 * @type boolean
 * @default false
 *
 * @param Position of enemy HP Gauge
 * @type select
 * @option As configured in Battle Core
 * @value default
 * @option Vertically centered
 * @value center
 * @default default
 *
 * @param Position of enemy name
 * @type select
 * @option As configured in Battle Core
 * @value default
 * @option Vertically centered
 * @value center
 * @default default
 *
 * @help
 * All options are off per default.
 *
 * Enemies' health bars and names are on a different layer from the other
 * enemy-related sprites, which may require further consideration.
 *
 * There's an argument that this plugin should allow to override other plugins'
 * options, so all all adjustments can be done there. This isn't supported yet
 * so enjoy your "go there, then there, then there, then change that" list.
 *
 * To only display enemy's names on select:
 * VisuMZ_1_BattleCore -> Enemy Battler Settings -> Name > Name Visibility
 * Turn all options to false save for By Selection?
 *
 * To reduce the length of the CTB bar:
 * VisuMZ_2_BattleSystemCTB -> Turn Order Display -> Slots > Total Horizontal
 *
 * To scale down state icons:
 * StateIconRework -> Scale of state icons
 *
 * To center state state icons:
 * StateIconRework -> Position of state icons
 */
(() => {
  const params = PluginManager.parameters("BattleUIAdjusters");
  const selectedEnemyInFront = params["Selected enemy in the foreground"] !== "false";
  const hpGaugePosition = params["Position of enemy HP Gauge"] || "default";
  const enemyNamePosition = params["Position of enemy name"] || "default";

  const alias_Sprite_Enemy_update = Sprite_Enemy.prototype.update;
  Sprite_Enemy.prototype.update = function () {
    alias_Sprite_Enemy_update.call(this);

    if (!this._battler) {
      return;
    }

    this.pushForwardIfSelected();
  };

  Sprite_Enemy.prototype.pushForwardIfSelected = function () {
    if (!selectedEnemyInFront) {
      return;
    }

    if (!this._battler.isSelected()) {
      return;
    }

    if (this.pushedToForeground) {
      return;
    }

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
  };

  const alias_Sprite_Battler_updateHpGaugePosition = Sprite_Battler.prototype.updateHpGaugePosition;
  Sprite_Battler.prototype.updateHpGaugePosition = function () {
    alias_Sprite_Battler_updateHpGaugePosition.call(this);

    const isEnemy = this instanceof Sprite_Enemy;
    if (!isEnemy || !this._hpGaugeSprite) {
      return;
    }

    if (hpGaugePosition === "center") {
      this._hpGaugeSprite.y += this.height / 2;
      if (enemyNamePosition === "center") {
        this._hpGaugeSprite.y -= 4;
      }
    }
  };

  const alias_Sprite_EnemyName_updatePosition = Sprite_EnemyName.prototype.updatePosition;
  Sprite_EnemyName.prototype.updatePosition = function () {
    alias_Sprite_EnemyName_updatePosition.call(this);

    if (!this._linkedSprite) {
      return;
    }

    if (enemyNamePosition === "center") {
      this.y -= this._linkedSprite.height / 2;
      if (hpGaugePosition === "center") {
        this.y += 4;
      }
    }
  };
})();
