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
 * Bug #2: Fix text being cut in the topmost textbox of the combat screen
 * Cause: Unknown. I just did a quick and dirty fix by adding a few pixels
 * of height so it looks better.
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

  // Bug #2
  const alias_Scene_Battle_helpAreaHeight = Scene_Battle.prototype.helpAreaHeight;
  Scene_Battle.prototype.helpAreaHeight = function () {
    return alias_Scene_Battle_helpAreaHeight.call(this) + 12;
  };
})();
