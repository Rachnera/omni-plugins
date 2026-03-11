//=============================================================================
// CompactSkillDescription.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Merge skill selection and skill description
 * @author Rachnera
 *
 * @help
 * The main idea is to get rid of that horrible help box at the top that takes
 * so much space and push around other elements each time it shows up.
 * This plugin is not really subtle in its behavior and will override several
 * of VisuStella Battle Core parameters without a second care.
 */

(() => {
  Window_BattleSkill.prototype.maxCols = function () {
    return 1;
  };

  Window_BattleSkill.prototype.itemHeight = function () {
    return (this.lineHeight() + 8) * 3;
  };

  Window_BattleSkill.prototype.drawItem = function (index) {
    const skill = this.itemAt(index);
    if (!skill) {
      return;
    }

    const costWidth = this.costWidth();
    const rect = this.itemLineRect(index);
    const yOffset = this.itemHeight() / 3 - this.itemPadding();

    this.changePaintOpacity(this.isEnabled(skill));

    this.drawItemName(skill, rect.x, rect.y - yOffset, rect.width - costWidth);
    this.drawSkillCost(skill, rect.x, rect.y - yOffset, rect.width);

    this.drawTextEx(skill.description, rect.x, rect.y - yOffset + this.lineHeight(), this.width);

    this.changePaintOpacity(1);
  };

  Scene_Battle.prototype.skillWindowRect = function () {
    const ww = Graphics.boxWidth - this._actorCommandWindow.width;
    const wh = this.windowAreaHeight();

    const wx = 0;
    const wy = Graphics.boxHeight - wh;

    return new Rectangle(wx, wy, ww, wh);
  };

  const alias_Window_BattleSkill_show = Window_BattleSkill.prototype.show;
  Window_BattleSkill.prototype.show = function () {
    alias_Window_BattleSkill_show.call(this);

    this.hideHelpWindow();
  };

  // For some reason escaping me, VisuStella Battle Core disables RMMZ
  // standard behavior of hiding unused windows in battle, meaning they show up
  // in the background of every transparent menu. This restores the default.
  Window_BattleStatus.prototype.hide = function () {
    Window_StatusBase.prototype.hide.call(this);
  };

  Window_CTB_TurnOrder.prototype.updatePosition = function () {
    return;
  };
})();
