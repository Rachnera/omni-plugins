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
        this._specialStateHP = 200;
      }

      this._specialStateHP -= 100;
      if (this._specialStateHP > 0) {
        return;
      }
    }

    alias_Game_Battler_addNewState.call(this, stateId);
  };
})();
