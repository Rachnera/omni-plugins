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
 * - This shows on the VisuStella MZ - Victory Aftermath screen (if > 0).
 * - This shows on quick battle results (if > 0).
 * - A different currency icon is drawn when $dataSystem.currencyUnit is "USD".
 */

(() => {
  // TODO Make those plugin options
  const variableId = 21;
  const moneyFoundMessage = "$%1 found!";
  const usdIconId = 313;

  const alias_BattleManager_makeRewards = BattleManager.makeRewards;
  BattleManager.makeRewards = function () {
    alias_BattleManager_makeRewards.call(this);
    this._rewards.usd = $gameTroop.usdTotal();
  };

  Game_Troop.prototype.usdTotal = function () {
    return this.deadMembers().reduce((r, enemy) => r + enemy.usd(), 0);
  };

  Game_Enemy.prototype.usd = function () {
    const regexp = /<USD>(.+)<\/USD>/ms;

    const result = this.enemy().note.match(regexp);

    if (!result) {
      return 0;
    }

    return Number(result[1]);
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

  const cheatCurrencyIcon = (originalFunc) => {
    const originalIconId = VisuMZ.CoreEngine.Settings.Gold.GoldIcon;

    if ($dataSystem.currencyUnit.trim() === "USD") {
      VisuMZ.CoreEngine.Settings.Gold.GoldIcon = usdIconId;
    }

    originalFunc();

    VisuMZ.CoreEngine.Settings.Gold.GoldIcon = originalIconId;
  };

  const alias_Window_Base_drawCurrencyValue = Window_Base.prototype.drawCurrencyValue;
  Window_Base.prototype.drawCurrencyValue = function (value, unit, x, y, width) {
    cheatCurrencyIcon(() => alias_Window_Base_drawCurrencyValue.call(this, value, unit, x, y, width));
  };

  const alias_Window_Gold_drawGoldItemStyle = Window_Gold.prototype.drawGoldItemStyle;
  Window_Gold.prototype.drawGoldItemStyle = function () {
    cheatCurrencyIcon(() => alias_Window_Gold_drawGoldItemStyle.call(this));
  };

  // Could technically have been manually configured in:
  // VisuMZ_3_VictoryAftermath -> General Settings > Reward Strips
  Window_VictoryRewards._rewardSets?.push({
    Label: "USD",
    Show: () => BattleManager._rewards.usd > 0,
    Text: () => "$",
    Data: () => BattleManager._rewards.usd,
  });
})();
