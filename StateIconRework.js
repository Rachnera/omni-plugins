//=============================================================================
// StateIconRework.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Display state icons side by side instead of rotating them
 * @author Rachnera
 *
 * @help
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
    // Does not self-update
  };

  // Disable original, "carousel", icon
  Sprite_StateIcon.prototype.update = function () {
    // Do nothing
  };
})();
