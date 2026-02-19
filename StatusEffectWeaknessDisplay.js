//=============================================================================
// StatusEffectWeaknessDisplay.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Display enemies' weakness/immunity to various status effects.
 * @author Rachnera
 *
 * @help
 * Tracked states (namely Opening, Wound, Damaged, Afflicted and Pushed)
 * are hardcoded in the script for now as there didn't seem to be much
 * value in supporting the additional logistics for them to be customizable.
 *
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
 *
 * You can force the reveal of an enemy resistance to a specific status effect,
 * even outside of combat, by calling the code snippet:
 * SEWD.revealEnemyResistance(enemyName, stateId)
 * For example, SEWD.revealEnemyResistance("Armored Zombie", 12) will reveal that
 * the Armored Zombie enemy has a weakness to Opening.
 */

const SEWD = {};

(() => {
  const statesToTrack = [12, 13, 14, 15, 22];

  let enemiesBenchmark = {};

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
      if (!statesToTrack.includes(stateId)) {
        continue;
      }
      registerStateForEnemy(target.originalName(), stateId);
    }
  };

  /* Persist discovered weaknesses on save/load */

  const alias_DataManager_makeSaveContents = DataManager.makeSaveContents;
  DataManager.makeSaveContents = function () {
    const contents = alias_DataManager_makeSaveContents.call(this);
    contents.enemiesBenchmark = enemiesBenchmark;
    return contents;
  };

  const alias_DataManager_extractSaveContents = DataManager.extractSaveContents;
  DataManager.extractSaveContents = function (contents) {
    alias_DataManager_extractSaveContents.call(this, contents);
    enemiesBenchmark = contents.enemiesBenchmark || {};
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

    if (enemiesBenchmark[battler.originalName()]) {
      for (let stateId of enemiesBenchmark[battler.originalName()]) {
        // Ignore eventual now obsolete data
        if (!statesToTrack.includes(stateId)) {
          continue;
        }

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

    this.drawText(
      weaknesses.length > 0 ? `Weak to ${weaknesses.join(", ")}` : "No known weakness",
      0,
      0,
      this.contents.width,
    );
    if (immunities.length > 0) {
      this.drawText(`Immune to ${immunities.join(", ")}`, 0, this.lineHeight(), this.contents.width);
    }
  };

  /* Utility function */
  const registerStateForEnemy = (key, stateId) => {
    if (!enemiesBenchmark[key]) {
      enemiesBenchmark[key] = [];
    }
    // Not using a Set cause I'm not sure how well the DataManager supports them
    if (!enemiesBenchmark[key].includes(stateId)) {
      enemiesBenchmark[key].push(stateId);
    }
  };

  SEWD.revealEnemyResistance = (enemyName, stateId) => {
    return registerStateForEnemy(enemyName, stateId);
  };
})();
