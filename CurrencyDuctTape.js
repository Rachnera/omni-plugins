//=============================================================================
// CurrencyDuctTape.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Allow second currency to work almost as first currency
 * @author Rachnera
 *
 * @help
 * Take a minimal change approach toward what already exists:
 * - Cash is still stored in variable 21
 * - That variable can still be manipulated/used as before
 *
 * The only changes are:
 * - Enemy can now be specified a cash reward as a notetag:
 *   <USD>25</USD>
 * - The appropriate amount of cash is awarded at the end of the battle
 * - This shows on the VisuStella MZ - Victory Aftermath screen
 * - This shows on quick battle results.
 */

(() => {
  // TODO Make those plugin options
  const variableId = 21;
  const moneyFoundMessage = "$%1 found!";

  const alias_BattleManager_makeRewards = BattleManager.makeRewards;
  BattleManager.makeRewards = function () {
    alias_BattleManager_makeRewards.call(this);
    this._rewards.usd = 10; //FIXME Hardcoded for example
  };

  const alias_BattleManager_displayRewards = BattleManager.displayRewards;
  BattleManager.displayRewards = function () {
    alias_BattleManager_displayRewards.call(this);
    this.displayUSD();
  };

  BattleManager.displayUSD = function () {
    const usd = this._rewards.usd;
    if (usd <= 0) {
      return;
    }

    $gameMessage.add("\\." + moneyFoundMessage.format(usd));
  };

  const alias_BattleManager_gainRewards = BattleManager.gainRewards;
  BattleManager.gainRewards = function () {
    alias_BattleManager_gainRewards.call(this);
    this.gainUSD();
  };

  BattleManager.gainUSD = function () {
    $gameVariables.setValue(variableId, ($gameVariables.value(variableId) || 0) + (this._rewards.usd || 0));
  };
})();
