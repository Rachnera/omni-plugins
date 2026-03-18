//=============================================================================
// StateIconRework.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Display state icons side by side instead of rotating them
 * @author Rachnera
 *
 * @help
 * Only for enemies at the moment
 *
 * Limited to seven different icons at once. This is a soft limit that can
 * easily be changed, though dealing with the design issue of where to place
 * all these icons on screen might prove more difficult.
 *
 * From a technical point of view, this does not replace the original,
 * "carousel", icons but instead hide them and create entirely new icons. As a
 * consequence, any piece of code affecting the original icons will silently
 * fail.
 */

(() => {
  const maxIcons = 7;

  const alias_Sprite_Enemy_createStateIconSprite = Sprite_Enemy.prototype.createStateIconSprite;
  Sprite_Enemy.prototype.createStateIconSprite = function () {
    alias_Sprite_Enemy_createStateIconSprite.call(this);

    this._staticStateIconSprites = [];
    for (let i = 0; i < maxIcons; i++) {
      const sprite = new Sprite_StaticStateIcon();
      this._staticStateIconSprites.push(sprite);
      this.addChild(sprite);
    }
  };

  const alias_Sprite_Enemy_update = Sprite_Enemy.prototype.update;
  Sprite_Enemy.prototype.update = function () {
    alias_Sprite_Enemy_update.call(this);

    if (!this._omniIconsCache) {
      this._omniIconsCache = [];
    }

    const icons = this._battler?.allIcons() || [];

    //Terrible array comparison
    if (icons.join("-") === this._omniIconsCache.join("-")) {
      return;
    }
    this._omniIconsCache = icons;

    const relevantStates = this._battler.states().filter((state) => state.iconIndex > 0);
    const relevantBuffes = [...Array(8).keys()].filter((i) => this._battler.buff(i) !== 0);

    const padding = 4;
    const widthWithPadding = ImageManager.iconWidth + padding * 2;

    for (let i = 0; i < maxIcons; i++) {
      const sprite = this._staticStateIconSprites[i];
      if (i >= icons.length) {
        sprite.hide();
        continue;
      }

      sprite.x = -((icons.length - 1) * widthWithPadding) / 2 + i * widthWithPadding;
      sprite.y = 0;
      sprite._iconIndex = icons[i];

      // Required to update the turns count live
      sprite._relevantState = i < relevantStates.length ? relevantStates[i] : null;
      sprite._relevantBuff = i >= relevantStates.length ? relevantBuffes[i - relevantStates.length] : null;

      sprite.updateFrame();
      sprite.show();
    }
  };

  const alias_Sprite_Enemy_setBattler = Sprite_Enemy.prototype.setBattler;
  Sprite_Enemy.prototype.setBattler = function (battler) {
    alias_Sprite_Enemy_setBattler.call(this, battler);

    this._staticStateIconSprites.forEach((sprite) => sprite.setup(battler));
  };

  function Sprite_StaticStateIcon() {
    this.initialize(...arguments);
  }
  Sprite_StaticStateIcon.prototype = Object.create(Sprite_StateIcon.prototype);
  Sprite_StaticStateIcon.prototype.constructor = Sprite_StaticStateIcon;

  Sprite_StaticStateIcon.prototype.update = function () {
    this.updateTurnDisplaySprite();
  };

  Sprite_StaticStateIcon.prototype.updateTurnDisplaySprite = function () {
    if (!this._battler || !this._iconIndex) {
      return;
    }

    this.resetFontSettings();
    this.contents.clear();

    if (this._relevantState) {
      Window_Base.prototype.drawActorStateTurns.call(this, this._battler, this._relevantState, 0, 0);
      Window_Base.prototype.drawActorStateData.call(this, this._battler, this._relevantState, 0, 0);
    }

    if (this._relevantBuff) {
      Window_Base.prototype.drawActorBuffTurns.call(this, this._battler, this._relevantBuff, 0, 0);
      Window_Base.prototype.drawActorBuffRates.call(this, this._battler, this._relevantBuff, 0, 0);
    }
  };

  const alias_Sprite_StateIcon_update = Sprite_StateIcon.prototype.update;
  Sprite_StateIcon.prototype.update = function () {
    if (this._battler instanceof Game_Enemy) {
      // Disable original, "carousel", icon, for enemies
      return;
    }

    alias_Sprite_StateIcon_update.call(this);
  };
})();
