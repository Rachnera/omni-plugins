//=============================================================================
// StatusHP.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Require a certain number of hits for a state to stick
 * @author Rachnera
 *
 * @param Enemy id
 * @desc The one enemy in the game that will be affected by that mechanic
 *
 * @param State id
 * @desc The one state in the game that will be affected by that mechanic
 *
 * @param State HP
 * @desc How many "HP" the state has. Each hit removes 100 of them. Applied at 0.
 * @default 200
 *
 * @help
 * Prototype:
 * - Only work for one specific status effect against one specific enemy
 * - Enemy must be vulnerable to the state
 *
 * For each state that can have HP, a gradient displaying its HP bar in sixteen
 * variants of fullness (from 0 to 15/16) must be added as a newline in
 * img/system/IconSet.png
 * AND it must be configured by adding to the state the following notetag:
 * <Partial Success Zero Icon: x>
 * Where x is the id of the first icon of the relevant line (thus should always
 * be a multiple of 16)
 */

(() => {
  const params = PluginManager.parameters("StatusHP");

  const specialStateId = parseInt(params["State id"]);
  const specialEnemyId = parseInt(params["Enemy id"]);
  const initialStateHP = parseInt(params["State HP"]) || 200;

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

  const shouldAbort = !specialStateId || !specialEnemyId || !initialStateHP;

  const alias_Game_Action_itemEffectAddState = Game_Action.prototype.itemEffectAddState;
  Game_Action.prototype.itemEffectAddState = function (target, effect) {
    alias_Game_Action_itemEffectAddState.call(this, target, effect);

    if (shouldAbort) {
      return;
    }

    const isEnemy = target instanceof Game_Enemy;
    if (!isEnemy || target._enemyId !== specialEnemyId) {
      return;
    }
  };

  const alias_Game_Battler_addNewState = Game_Battler.prototype.addNewState;
  Game_Battler.prototype.addNewState = function (stateId) {
    if (shouldAbort) {
      return alias_Game_Battler_addNewState.call(this, stateId);
    }

    if (stateId === specialStateId && this instanceof Game_Enemy && this._enemyId === specialEnemyId) {
      if (!this._specialStateHP) {
        this._specialStateHP = {};
      }

      // Same behavior if not set or zero
      if (!this._specialStateHP[stateId] || this._specialStateHP[stateId] < 0) {
        this._specialStateHP[stateId] = initialStateHP;
      }

      this._specialStateHP[stateId] -= 100;
      if (this._specialStateHP[stateId] > 0) {
        return;
      }
    }

    alias_Game_Battler_addNewState.call(this, stateId);
  };

  const alias_Sprite_Enemy_update = Sprite_Enemy.prototype.update;
  Sprite_Enemy.prototype.update = function () {
    alias_Sprite_Enemy_update.call(this);

    if (shouldAbort) {
      return;
    }

    if (this._battler?._enemyId !== specialEnemyId) {
      return;
    }

    if (!this._staticStateIconSprites || !this._staticStateIconSprites.length) {
      return;
    }

    if (!this._battler._specialStateHP || !(specialStateId in this._battler._specialStateHP)) {
      return;
    }

    const doNotDisplay =
      !this._battler._specialStateHP[specialStateId] ||
      this._battler._specialStateHP[specialStateId] <= 0 ||
      this._battler._specialStateHP[specialStateId] >= initialStateHP ||
      !this._battler.isAlive();

    const relevantIcons = getGradient(specialStateId);

    const iconToShow = relevantIcons[Math.floor((16 * this._battler._specialStateHP[specialStateId]) / initialStateHP)];
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

    for (let i = 0; i < firstAvailableSpriteIndex + 1; i++) {
      const sprite = this._staticStateIconSprites[i];

      sprite.readjustPosition(i, firstAvailableSpriteIndex + 1, this);
    }
  };
})();
