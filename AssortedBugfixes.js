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
 * Retroactive fix: Yes
 * =====
 */
(() => {
  // Bug #1
  // Sanitize the output rather than the input to salvage saves with a bad value
  const alias_Game_Party_maxBattleMembers = Game_Party.prototype.maxBattleMembers;
  Game_Party.prototype.maxBattleMembers = function () {
    return Number(alias_Game_Party_maxBattleMembers.call(this));
  };
})();
