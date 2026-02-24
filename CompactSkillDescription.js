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

  const commandWindowWidth = 320;

  Scene_Battle.prototype.skillWindowRect = function () {
    const ww = commandWindowWidth;
    const wh = this.windowAreaHeight();

    const wx = Graphics.boxWidth - commandWindowWidth;
    const wy = Graphics.boxHeight - wh;

    return new Rectangle(wx, wy, ww, wh);
  };

  Scene_Battle.prototype.helpWindowRect = function () {
    const ww = Graphics.boxWidth - commandWindowWidth;
    const wh = this.windowAreaHeight();

    const wx = 0;
    const wy = Graphics.boxHeight - wh;

    return new Rectangle(wx, wy, ww, wh);
  };

  // For some reason escaping me, VisuStella Battle Core disables RMMZ
  // standard behavior of hiding unused windows in battle, meaning they show up
  // in the background of every transparent menu. This restores the default.
  Window_ActorCommand.prototype.hide = function () {
    Window_StatusBase.prototype.hide.call(this);
  };
  Window_BattleStatus.prototype.hide = function () {
    Window_StatusBase.prototype.hide.call(this);
  };

  Window_CTB_TurnOrder.prototype.updatePosition = function () {
    return;
  };
})();
