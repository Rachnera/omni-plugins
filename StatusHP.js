//=============================================================================
// StatusHP.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Require a certain number of hits for a state to stick
 * @author Rachnera
 *
 * @help
 * Relevant enemies must be configured with the following notetag:
 * <Partial State Resist: x, y>
 * Where x is the id of the state and y the base HP of it. Each attempt at
 * applying it removes 100¹ "state HP", so a y of 200 means two hits are needed
 * for it to stick, 300 tranlastes into three hits etc.
 * Tag can be put multiple times with multiple states for the same enemy.
 *
 * Note: The enemy must be vulnerable to the state for this to work. Otherwise,
 * its immunity takes priority.
 *
 * For each state that can have HP, a gradient displaying its HP bar in sixteen
 * variants of fullness (from 0 to 15/16) must be added as a newline in
 * img/system/IconSet.png
 * AND it must be configured by adding to the state the following notetag:
 * <Partial Success Zero Icon: x>
 * Where x is the id of the first icon of the relevant line (thus should always
 * be a multiple of 16)
 *
 * ¹Value not configurable at the moment.
 */

(() => {
  const params = PluginManager.parameters("StatusHP");

  const getStatesHp = (enemyId) => {
    const enemy = $dataEnemies[enemyId];

    if (!enemy) {
      return {};
    }

    const regexp = /<Partial State Resist:\s*([0-9]+)\s*,\s*([0-9]+)\s*>/gms;

    const result = enemy.note.matchAll(regexp);

    const groupedByStateId = {};
    for (let match of result) {
      groupedByStateId[parseInt(match[1])] = parseInt(match[2]);
    }
    return groupedByStateId;
  };

  const getZeroIconIndex = (stateId) => {
    const state = $dataStates[stateId];

    if (!state) {
      return;
    }

    const regexp = /<Partial Success Zero Icon:\s*([0-9]+)\s*>/;

    const result = state.note.match(regexp);

    if (!result) {
      return;
    }

    return parseInt(result[1]);
  };

  const getGradient = (stateId) => {
    const zeroIndex = getZeroIconIndex(stateId);

    if (!zeroIndex) {
      return [];
    }

    return Array.from(Array(16).keys()).map((i) => i + zeroIndex);
  };

  const alias_Game_Battler_addNewState = Game_Battler.prototype.addNewState;
  Game_Battler.prototype.addNewState = function (stateId) {
    if (this instanceof Game_Enemy) {
      const statesWithHp = getStatesHp(this._enemyId);
      if (stateId in statesWithHp) {
        if (!this._specialStateHP) {
          this._specialStateHP = {};
        }

        // Same behavior if not set or zero
        if (!this._specialStateHP[stateId] || this._specialStateHP[stateId] < 0) {
          this._specialStateHP[stateId] = statesWithHp[stateId];
        }

        this._specialStateHP[stateId] -= 100;
        if (this._specialStateHP[stateId] > 0) {
          return;
        }
      }
    }

    alias_Game_Battler_addNewState.call(this, stateId);
  };

  const alias_Sprite_Enemy_update = Sprite_Enemy.prototype.update;
  Sprite_Enemy.prototype.update = function () {
    alias_Sprite_Enemy_update.call(this);

    const isEnemy = this._battler instanceof Game_Enemy;
    if (!isEnemy) {
      return;
    }

    if (!this._staticStateIconSprites?.length) {
      return;
    }

    if (!this._battler._specialStateHP) {
      return;
    }

    const statesWithHp = getStatesHp(this._battler._enemyId);

    Object.keys(this._battler._specialStateHP)
      .map((n) => parseInt(n))
      .forEach((stateId) => {
        const currentHp = this._battler._specialStateHP[stateId];
        const maxHp = statesWithHp[stateId];

        const doNotDisplay = !currentHp || currentHp < 0 || currentHp >= maxHp || !this._battler.isAlive();

        const relevantIcons = getGradient(stateId);

        const iconToShow = relevantIcons[Math.floor((16 * currentHp) / maxHp)];
        const currentlyDisplayed = this._staticStateIconSprites.some((sprite) => sprite._iconIndex === iconToShow);

        // The way the code currently works, there's an automatic clean up when the state is actually applied
        if (doNotDisplay || currentlyDisplayed) {
          return;
        }

        // First searching if there's a partial state icon already
        let firstAvailableSpriteIndex = this._staticStateIconSprites.findIndex((sprite) => {
          return relevantIcons.includes(sprite._iconIndex);
        });

        // If not, look for first avaiable sprite
        if (firstAvailableSpriteIndex === -1) {
          firstAvailableSpriteIndex = this._staticStateIconSprites.findIndex((sprite) => !sprite._iconIndex);
        }

        if (firstAvailableSpriteIndex === -1) {
          return;
        }

        const firstAvailableSprite = this._staticStateIconSprites[firstAvailableSpriteIndex];

        firstAvailableSprite._iconIndex = iconToShow;
        firstAvailableSprite.updateFrame();
        firstAvailableSprite.show();

        const totalNumberOfIcons = this._staticStateIconSprites.findIndex((sprite) => !sprite._iconIndex) + 1;
        for (let i = 0; i < totalNumberOfIcons; i++) {
          const sprite = this._staticStateIconSprites[i];
          sprite.readjustPosition(i, totalNumberOfIcons, this);
        }
      });
  };
})();
