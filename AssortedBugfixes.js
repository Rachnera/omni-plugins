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
 * =====
 * Bug #2: Graphical glitches within the name input's help box
 * Cause: VisuMZ_0_CoreEngine was always behaving like there was five elements
 * (hardcoded value) regardless of how many things were crammed in this box.
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
  const alias_Window_ButtonAssist_initialize = Window_ButtonAssist.prototype.initialize;
  Window_ButtonAssist.prototype.initialize = function (rect) {
    const missingPixels = 4;

    alias_Window_ButtonAssist_initialize.call(
      this,
      new Rectangle(rect.x - missingPixels, rect.y, rect.width + 2 * missingPixels, rect.height),
    );
  };

  Window_ButtonAssist.prototype.refresh = function () {
    this.contents.clear();

    const config = SceneManager._scene;
    const textFmt = VisuMZ.CoreEngine.Settings.ButtonAssist.TextFmt;

    const toDraw = [];

    for (let i = 1; i <= 5; i++) {
      const a1 = config["buttonAssistKey%1".format(i)]();
      const a2 = config["buttonAssistText%1".format(i)]();

      this._data["key%1".format(i)] = a1;
      this._data["text%1".format(i)] = a2;

      if (!!a1 && !!a2) {
        toDraw.push({
          text: textFmt.format(a1, a2),
          offset: config["buttonAssistOffset%1".format(i)](),
        });
      }
    }

    const width = this.innerWidth / toDraw.length;
    const padding = this.itemPadding();
    let x = 0;

    toDraw.forEach(({ text, offset }) => {
      x += padding + offset;
      this.drawTextEx(text, x, 0, width - padding * 2);
      x += padding + width;
    });
  };
})();
