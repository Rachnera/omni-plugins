//=============================================================================
// AssortedBugfixes.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Various pieces of code to be called through the Script command
 * @author Rachnera
 * @help
 * =====
 * instaWinBattle(troopId): Call the code to trigger a battle against the troop
 * with the given id, immediately kill all enemies, and award rewards but
 * without ever showing any battle-related screen.
 * =====
 */

const instaWinBattle = (troopId) => {
  BattleManager.setup(troopId);
  $gameTroop.members().forEach((enemy) => enemy.addNewState(1));
  BattleManager.makeRewards();
  BattleManager.displayRewards();
  BattleManager.gainRewards();
  BattleManager.endBattle(0);
};
