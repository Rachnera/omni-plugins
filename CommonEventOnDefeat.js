//=============================================================================
// CommonEventOnDefeat.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Run the specified common event on party defeat
 * @author Rachnera
 *
 * @param Common Event Id
 * @desc Id of the common Event to be played on party loses
 * @default 0
 *
 * @help
 * If a battle has a "can lose" branch, it will takes precedence over running
 * the common event.
 *
 * If the Common Event Id is set to 0, Game Over will proceed as normal.
 *
 * If no common event exists for the specified id, all hell will break lose.
 */

(() => {
  const params = PluginManager.parameters("CommonEventOnDefeat");
  const commonEventToCallOnDefeat = parseInt(params["Common Event Id"]);

  const alias_Rachnera_CEOD_BattleManager_updateBattleEnd = BattleManager.updateBattleEnd;
  BattleManager.updateBattleEnd = function () {
    if ($gameParty.isAllDead() && !this._escaped && !this._canLose && !!commonEventToCallOnDefeat) {
      $gameParty.reviveBattleMembers();
      SceneManager.pop();
      this._phase = "";
      return $gameTemp.reserveCommonEvent(commonEventToCallOnDefeat);
    }

    alias_Rachnera_CEOD_BattleManager_updateBattleEnd.call(this);
  };
})();
