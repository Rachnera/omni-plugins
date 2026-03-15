//=============================================================================
// SkillAntiCosts.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Show TP regain of skills similar to TP costs
 * @author Rachnera
 *
 * @help
 * The case where a skill both costs and restores TP to its user isn't covered.
 */

(() => {
  // TODO

  const alias_Window_Base_drawSkillCost = Window_Base.prototype.drawSkillCost;
  Window_Base.prototype.drawSkillCost = function (actor, skill, x, y, width) {
    const regexp = /user\.gainTp\(([0-9]+)\)/;
    const result = skill?.note?.match(regexp);

    if (!result) {
      return alias_Window_Base_drawSkillCost.call(this, actor, skill, x, y, width);
    }

    const tpGain = Number(result[1]);

    const text = "\\FS[22] \\C[14] +%1 Energy".format(tpGain);

    this.drawTextEx(text, x + width - this.textSizeEx(text).width, y, width);
    this.resetFontSettings();
  };
})();
