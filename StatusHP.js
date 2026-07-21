//=============================================================================
// StatusHP.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Require a certain number of hits for a state to stick
 * @author Rachnera
 *
 * @help
 * Prototype:
 * - Only work for one specific status effect against one specific enemy
 * - Enemy must be vulnerable to the state
 * - Always require two hits
 */

(() => {
  const specialStateId = 13;
  const specialEnemyId = 93;
  const initialStateHP = 200;

  const alias_Game_Action_itemEffectAddState = Game_Action.prototype.itemEffectAddState;
  Game_Action.prototype.itemEffectAddState = function (target, effect) {
    alias_Game_Action_itemEffectAddState.call(this, target, effect);

    const isEnemy = target instanceof Game_Enemy;
    if (!isEnemy || target._enemyId !== specialEnemyId) {
      return;
    }
  };

  const alias_Game_Battler_addNewState = Game_Battler.prototype.addNewState;
  Game_Battler.prototype.addNewState = function (stateId) {
    if (stateId === specialStateId && this instanceof Game_Enemy && this._enemyId === specialEnemyId) {
      if (!this._specialStateHP || this._specialStateHP < 0) {
        this._specialStateHP = initialStateHP;
      }

      this._specialStateHP -= 100;
      if (this._specialStateHP > 0) {
        return;
      }
    }

    alias_Game_Battler_addNewState.call(this, stateId);
  };

  const alias_Sprite_Enemy_update = Sprite_Enemy.prototype.update;
  Sprite_Enemy.prototype.update = function () {
    alias_Sprite_Enemy_update.call(this);

    if (this._battler?._enemyId !== specialEnemyId) {
      return;
    }

    if (!this._staticStateIconSprites || !this._staticStateIconSprites.length) {
      return;
    }

    const doNotDisplay =
      !this._battler._specialStateHP ||
      this._battler._specialStateHP <= 0 ||
      this._battler._specialStateHP >= initialStateHP ||
      !this._battler.isAlive();
    const iconToShow = 80;
    const currentlyDisplayed = this._staticStateIconSprites.some((sprite) => sprite._iconIndex === iconToShow);

    // The way the code currently works, there's an automatic clean up when the state is actually applied
    if (doNotDisplay || currentlyDisplayed) {
      return;
    }

    const firstAvailableSpriteIndex = this._staticStateIconSprites.findIndex((sprite) => !sprite._iconIndex);

    if (firstAvailableSpriteIndex === -1) {
      return;
    }

    const firstAvailableSprite = this._staticStateIconSprites[firstAvailableSpriteIndex];

    firstAvailableSprite._iconIndex = iconToShow;
    firstAvailableSprite.updateFrame();
    firstAvailableSprite.show();

    for (let i = 0; i < firstAvailableSpriteIndex + 1; i++) {
      const sprite = this._staticStateIconSprites[i];

      sprite.readjustPosition(i, firstAvailableSpriteIndex + 1, this);
    }
  };
})();
