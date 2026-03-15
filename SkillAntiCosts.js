//=============================================================================
// SkillAntiCosts.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Show TP regain of skills similar to TP costs
 * @author Rachnera
 *
 * @param Text format
 * @desc %1 is automatically replaced with the appropriate value.
 * @default \FS[22] \C[14] +%1 Energy
 *
 * @help
 * All standard text codes should be supported within the text format option:
 * https://www.yanfly.moe/wiki/Category:Text_Codes_(MZ)
 *
 * Only self-recovery ("user.gainTP") is considered for the purpose of this
 * plugin. Information about other characters' gaining TP should be conveyed in
 * a different way.
 *
 * The case where a skill both costs and restores TP to its user isn't covered.
 */

(() => {
  const params = PluginManager.parameters("SkillAntiCosts");
  const textFormat = params["Text format"] || "\\FS[22] \\C[14] +%1 Energy";

  const alias_Window_Base_drawSkillCost = Window_Base.prototype.drawSkillCost;
  Window_Base.prototype.drawSkillCost = function (actor, skill, x, y, width) {
    const regexp = /user\.gainTp\(([0-9]+)\)/;
    const result = skill?.note?.match(regexp);

    if (!result) {
      return alias_Window_Base_drawSkillCost.call(this, actor, skill, x, y, width);
    }

    const tpGain = Number(result[1]);

    const text = textFormat.format(tpGain);

    this.drawTextEx(text, x + width - this.textSizeEx(text).width, y, width);
    this.resetFontSettings();
  };
})();
