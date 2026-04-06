//=============================================================================
// AssortedBugfixes.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc For minor bugs that don't deserve their own plugin
 * @author Rachnera
 * @help
 * =====
 * Bug #1: Battlers sometimes becoming invisible
 * Cause: LvMZ_PartySizeControl plugin command did not always cast number-like
 * string inputs to numbers. A not-a-number that was eventually used to compute
 * the position of battlers. And since, in JS, 2+2=4 but 2+"2"="22", the value
 * was way off. Like, completely offscreen off.
 * =====
 * Bug #2: State Rate 0% not being equivalent to State Resist
 * Not technically a bug per say as I guess there are use cases where this can
 * make sense but, in the case of this project, putting an equal sign between
 * the two should spare a few headaches now and in the future.
 * =====
 * Bug #3: MZ default event fast forward triggering choices unintentionally
 * (because it's triggered by long pressing the "ok" key).
 * Solution: Have the quick events (also) happen when pressing the VisuStella
 * fast forward key (default: Page Down/RB).
 * Possible caveat: There might be a good reason why VS didn't do that natively.
 * =====
 * Bug #4: Confusing "HP Damage Multiplier" in skill description
 * Just removing the line for now
 * =====
 * Bug #5: Enemies sometimes using skills they shouldn't be able to use
 * Cause: While the exact course through the code still isn't well understood,
 * investigations suggest that the following happens:
 *   1. PC takes their first action out of two consecutive ones
 *   2. Enemy selects their next action
 *   3. CTB sets PC as next to act
 *   4. PC takes their second action
 *   5. Enemy's turn is resumed and they take the action selected in 2
 * To work around that, we force the enemy to reselect their move anew just
 * before acting.
 * =====
 */
(() => {
  // Bug #1
  // Sanitize the output rather than the input to salvage saves with a bad value
  const alias_Game_Party_maxBattleMembers = Game_Party.prototype.maxBattleMembers;
  Game_Party.prototype.maxBattleMembers = function () {
    return Number(alias_Game_Party_maxBattleMembers.call(this));
  };

  // Bug #2
  const alias_Game_BattlerBase_isStateResist = Game_BattlerBase.prototype.isStateResist;
  Game_BattlerBase.prototype.isStateResist = function (stateId) {
    if (this.stateRate(stateId) === 0) {
      return true;
    }

    return alias_Game_BattlerBase_isStateResist.call(this, stateId);
  };

  // Bug #3
  const alias_Scene_Map_isFastForward = Scene_Map.prototype.isFastForward;
  Scene_Map.prototype.isFastForward = function () {
    if (alias_Scene_Map_isFastForward.call(this)) {
      return true;
    }

    if (!$gameMap.isEventRunning() || SceneManager.isSceneChanging()) {
      return false;
    }

    if (Input.isPressed(VisuMZ.MessageCore.Settings.General.FastForwardKey)) {
      return true;
    }

    return false;
  };

  // Bug #4
  Window_ShopStatus.prototype.drawItemDamageAmount = function () {
    return false;
  };

  // Bug #5
  const alias_BattleManager_processTurnCTB = BattleManager.processTurnCTB;
  BattleManager.processTurnCTB = function () {
    if (this._subject instanceof Game_Enemy) {
      this._subject.makeActions();
    }

    alias_BattleManager_processTurnCTB.call(this);
  };
})();
