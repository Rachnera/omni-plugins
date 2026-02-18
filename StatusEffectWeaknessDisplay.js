//=============================================================================
// StatusEffectWeaknessDisplay.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Display enemies' weakness/immunity to various status effects.
 * @author Rachnera
 *
 * @help
 * Enemies are identified by names to support tricks like several different
 * enemies sharing a name and a sprite.
 *
 * Only status with a 0% or 100% resistance are displayed.
 *
 * For now, the informations are displayed when targeting the enemy in raw text
 * inside the help window at the top of the combat screen. Not the best place
 * and the best timing but good enough for a prototype. That window previously
 * displayed the name of the enemy, an information already available under its
 * sprite.
 */

(() => {
  const enemiesBenchmark = {};

  Game_Enemy.prototype.SEWDKey = function () {
    return this.originalName();
  };

  /* Registering when a status effect is applied to an enemy (even if it fails to stick) */

  const alias_Game_Action_itemEffectAddState = Game_Action.prototype.itemEffectAddState;
  Game_Action.prototype.itemEffectAddState = function (target, effect) {
    alias_Game_Action_itemEffectAddState.call(this, target, effect);

    const isEnemy = target instanceof Game_Enemy;
    if (!isEnemy) {
      return;
    }

    const states = effect.dataId !== 0 ? [effect.dataId] : this.subject().attackStates();
    for (const stateId of states) {
      if (stateId === target.deathStateId()) {
        continue;
      }
      const key = target.SEWDKey();
      if (!enemiesBenchmark[key]) {
        enemiesBenchmark[key] = new Set();
      }
      enemiesBenchmark[key].add(stateId);
    }
  };

  /* Displaying the info in combat */

  const alias_Window_Help_drawBattler = Window_Help.prototype.drawBattler;
  Window_Help.prototype.drawBattler = function (battler) {
    // Reset to default just in case
    this.changeTextColor(ColorManager.textColor(0));

    const isEnemy = battler instanceof Game_Enemy;

    if (!isEnemy) {
      return alias_Window_Help_drawBattler.call(this, battler);
    }

    const weaknesses = [];
    const immunities = [];

    if (enemiesBenchmark[battler.SEWDKey()]) {
      for (let stateId of enemiesBenchmark[battler.SEWDKey()]) {
        const stateName = $dataStates[stateId].name;
        const stateRate = battler.stateRate(stateId);

        if (stateRate === 1) {
          weaknesses.push(stateName);
        }

        if (stateRate === 0) {
          immunities.push(stateName);
        }
      }
    }

    if (weaknesses.length === 0 && immunities.length === 0) {
      const text = "No known information about this enemy";

      const wx = 0;
      const wy = (this.contents.height - this.lineHeight()) / 2;
      this.changeTextColor(ColorManager.textColor(7)); // Greyish text
      return this.drawText(text, wx, wy, this.contents.width, "center");
    }

    this.drawText(weaknesses.length > 0 ? `Weak to ${weaknesses.join(", ")}` : "No known weakness", 0, 0, this.contents.width);
    if (immunities.length > 0) {
      this.drawText(`Immune to ${immunities.join(", ")}`, 0, this.lineHeight(), this.contents.width);
    }
  };
})();
