//=============================================================================
// StatusEffectDescriptionOnSkillSelect.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc On skill selection, also describe status effect
 * @author Rachnera
 *
 * @help
 * Only status effects whose description was configured via the notetag
 * <Battle Hint> will show up.
 *
 * The display currently only supports a maximum of three status effects at
 * once. Any extra won't appear (but the code won't break either).
 *
 * Automatic word wrap is dependent upon Visustella Message Core.
 */

(() => {
  const maxNumberOfBoxes = 3;

  const stateColor = 6;

  const alias_Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
  Scene_Battle.prototype.createAllWindows = function () {
    this.createStatusEffectDescriptionWindows();

    alias_Scene_Battle_createAllWindows.call(this);
  };

  Scene_Battle.prototype.createStatusEffectDescriptionWindows = function () {
    this._statusEffectDescriptionWindows = [];
    for (let i = 0; i < maxNumberOfBoxes; i++) {
      this.createStatusEffectDescriptionWindow(i);
    }
  };

  Scene_Battle.prototype.createStatusEffectDescriptionWindow = function (i) {
    const lines = 4;

    const lineHeight = 36;
    const padding = 8;

    const height = (lineHeight + 4) * lines + padding * 2;
    const width = height * 2.5;

    const scale = 0.6;

    const x = padding + i * (width * scale + padding);
    const y = Graphics.boxHeight - this.windowAreaHeight() - height * scale - padding;

    const wind = new Window_StatusEffectDescription(new Rectangle(x, y, width, height), scale);
    this._statusEffectDescriptionWindows.push(wind);
    this.addWindow(wind);
  };

  Window_StatusEffectDescription.prototype = Object.create(Window_Base.prototype);
  Window_StatusEffectDescription.prototype.constructor = Window_StatusEffectDescription;
  function Window_StatusEffectDescription() {
    this.initialize(...arguments);
  }

  Window_StatusEffectDescription.prototype.initialize = function (rect, scale) {
    Window_Base.prototype.initialize.call(this, rect);

    this.scale.x = this.scale.y = scale;

    this.hide();
  };

  Window_StatusEffectDescription.prototype.updateBackOpacity = function () {
    this.backOpacity = 240;
  };

  Window_StatusEffectDescription.prototype.setText = function (text) {
    if (text !== this._text) {
      this.contents.clear();

      const padding = this.itemPadding();

      this.drawTextEx("<WordWrap>" + text, padding, padding, this.innerWidth - padding * 2);

      this._text = text;
    }
  };

  const alias_Scene_Battle_update = Scene_Battle.prototype.update;
  Scene_Battle.prototype.update = function () {
    alias_Scene_Battle_update.call(this);

    skill = this._skillWindow.active ? this._skillWindow.item() : null;

    if (skill?.id === this.SEDOSS_skillId) {
      return;
    }

    this.SEDOSS_skillId = skill?.id;

    if (!this.SEDOSS_skillId) {
      return this._statusEffectDescriptionWindows.forEach((wind) => wind.hide());
    }

    const regexp = /<Battle Hint>(.+)<\/Battle Hint>/ms;

    const states = skill.effects
      .filter((effect) => effect.code === Game_Action.EFFECT_ADD_STATE)
      .map((effect) => $dataStates[effect.dataId])
      .filter((state) => state?.note?.match(regexp));

    if (states.length === 0) {
      return this._statusEffectDescriptionWindows.forEach((wind) => wind.hide());
    }

    for (let i = 0; i < maxNumberOfBoxes; i++) {
      const state = states[i];

      if (!state) {
        this._statusEffectDescriptionWindows[i].hide();
        continue;
      }

      let text = `\\C[${stateColor}]\\I[${state.iconIndex}]${state.name}\\C[0]: `;
      text += state.note.match(regexp)[1].trim();
      this._statusEffectDescriptionWindows[i].setText(text);
      this._statusEffectDescriptionWindows[i].show();
    }
  };
})();
