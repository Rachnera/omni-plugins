//=============================================================================
// StatusEffectWeaknessDisplay.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Display enemies' weakness/immunity to various status effects.
 * @author Rachnera
 *
 * @help
 * This plugin requires the SEWD_icons.png file to be in the js/plugins/
 * folder to work.
 *
 * Tracked states (namely Opening, Wound, Damaged, Afflicted and Pushed)
 * are hardcoded in the script for now as there didn't seem to be much
 * value in supporting the additional logistics for them to be customizable.
 *
 * Enemies are identified by names to support tricks like several different
 * enemies sharing a name and a sprite.
 *
 * You can force the reveal of an enemy resistance to a specific status effect,
 * even outside of combat, by calling the code snippet:
 * SEWD.revealEnemyResistance(enemyName, stateId)
 * For example, SEWD.revealEnemyResistance("Armored Zombie", 12) will reveal that
 * the Armored Zombie enemy has a weakness to Opening.
 */

const SEWD = {};

(() => {
  const config = {
    icon: {
      file: {
        name: "SEWD_icons",
        folder: "js/plugins/",
      },
      size: 32,
    },
    states: [
      { id: 12, iconLine: 1 }, // Opening
      { id: 13, iconLine: 2 }, // Wound
      { id: 14, iconLine: 3 }, // Damaged
      { id: 15, iconLine: 4 }, // Afflicted
      { id: 22, iconLine: 0, displayOnlyIfVulnerable: true }, // Pushed
    ],
  };

  const statesToTrack = config.states.map(({ id }) => id);

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
      SEWD.revealEnemyResistance(target.originalName(), stateId);
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
  const alias_Sprite_Enemy_initialize = Sprite_Enemy.prototype.initialize;
  Sprite_Enemy.prototype.initialize = function (battler) {
    alias_Sprite_Enemy_initialize.call(this, battler);

    this._stateResistanceIcons = [];

    let visibleStateIndexes = [];
    for (let i = 0; i < statesToTrack.length; i++) {
      if (config.states[i].displayOnlyIfVulnerable && battler.stateRate(config.states[i].id) === 0) {
        continue;
      }

      visibleStateIndexes.push(i);
    }

    visibleStateIndexes.forEach((i) => {
      const icon = new Sprite_StateResistanceIcon(battler, i, visibleStateIndexes.length);
      this._stateResistanceIcons.push(icon);
      this.addChild(icon);
    });
  };

  function Sprite_StateResistanceIcon() {
    this.initialize(...arguments);
  }

  Sprite_StateResistanceIcon.prototype = Object.create(Sprite.prototype);
  Sprite_StateResistanceIcon.prototype.constructor = Sprite_StateResistanceIcon;

  Sprite_StateResistanceIcon.prototype.initialize = function (enemy, index, total) {
    Sprite.prototype.initialize.call(this);

    this._enemy = enemy;
    this._index = index;
    this._resistance = null;

    this.anchor.x = 0.5;
    this.anchor.y = 0.5;

    this.x = -(config.icon.size * total) / 2 + index * config.icon.size + config.icon.size / 2;

    this.bitmap = ImageManager.loadBitmap(config.icon.file.folder, config.icon.file.name);
  };

  Sprite_StateResistanceIcon.prototype.update = function () {
    Sprite.prototype.update.call(this);

    if (!this._enemy?.isSelected()) {
      this.hide();
      return;
    }

    this.show();

    const stateId = config.states[this._index].id;
    let resistance = 0; // 0 = unknown, 1 = weak, 2 = immune

    if (enemiesBenchmark[this._enemy.originalName()]?.includes(stateId)) {
      resistance = this._enemy.stateRate(stateId) === 0 ? 2 : 1;
    }

    if (resistance === this._resistance) {
      return;
    }

    this._resistance = resistance;

    this.setFrame(
      config.icon.size * resistance,
      config.icon.size * config.states[this._index].iconLine,
      config.icon.size,
      config.icon.size,
    );
  };

  /* Public API */
  SEWD.revealEnemyResistance = (enemyName, stateId) => {
    if (!enemiesBenchmark[enemyName]) {
      enemiesBenchmark[enemyName] = [];
    }
    // Not using a Set cause I'm not sure how well the DataManager supports them
    if (!enemiesBenchmark[enemyName].includes(stateId)) {
      enemiesBenchmark[enemyName].push(stateId);
    }
  };
})();
