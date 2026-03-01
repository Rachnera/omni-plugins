//=============================================================================
// FinisherWeaknessPopup.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Transform VS Weakness Popups to interact with states and punishers.
 * @author Rachnera
 *
 * @param StatePunisherSuccess:struct
 * @text Punisher Popup Settings
 * @type struct<Popup>
 * @default {"General":"","enabled:eval":"true","Image":"","filename:str":"","Render":"","text:str":"WEAKNESS!","bitmapWidth:num":"600","bitmapHeight:num":"200","fontFace:str":"Impact","fontSize:num":"48","fontBold:eval":"true","fontItalic:eval":"false","textColor:str":"#ed1c24","outlineSize:num":"5","outlineColor:str":"rgba(0, 0, 0, 1.0)","Offset":"","offsetX:num":"0","offsetY:num":"0","Scale":"","scaleDuration:num":"20","startScaleX:num":"2.0","startScaleY:num":"2.0","targetScaleX:num":"1.0","targetScaleY:num":"1.0","Acceleration":"","startSpeedX:num":"0","startSpeedY:num":"0","deltaSpeedX:num":"-0.05","deltaSpeedY:num":"0","Fading":"","opaqueDuration:num":"40","fadeDuration:num":"20"}
 *
 * @param StatePunisherFailure:struct
 * @text Punisher Failure Popup Settings
 * @desc For when a punisher skill is used against an enemy without the right state
 * @type struct<Popup>
 * @default {"General":"","enabled:eval":"true","Image":"","filename:str":"","Render":"","text:str":"RESIST!","bitmapWidth:num":"600","bitmapHeight:num":"200","fontFace:str":"Impact","fontSize:num":"46","fontBold:eval":"true","fontItalic:eval":"false","textColor:str":"#82ca9c","outlineSize:num":"5","outlineColor:str":"rgba(0, 0, 0, 1.0)","Offset":"","offsetX:num":"0","offsetY:num":"0","Scale":"","scaleDuration:num":"20","startScaleX:num":"2.0","startScaleY:num":"2.0","targetScaleX:num":"1.0","targetScaleY:num":"1.0","Acceleration":"","startSpeedX:num":"0","startSpeedY:num":"0","deltaSpeedX:num":"-0.05","deltaSpeedY:num":"0","Fading":"","opaqueDuration:num":"40","fadeDuration:num":"20"}
 *
 * @help
 * Depends on VisuStella MZ - Weakness Popups.
 *
 * Display the configured popups when using a punisher skill against an enemy
 * with the right status and against an enemy unproperly prepared.
 * VS "Element Rate >= 200%" (Weakness!) and "Element Rate <= 25%" (Resist!)
 * were used as a basis for default values.
 */
// The next 250 lines or so are copy-pasted from Weakness Popups and only used
// to display params slightly better in the plugin manager
/* ----------------------------------------------------------------------------
 * Popup Settings
 * ----------------------------------------------------------------------------
 */
/*~struct~Popup:
 *
 * @param General
 *
 * @param enabled:eval
 * @text Enabled
 * @parent General
 * @type boolean
 * @on Enabled
 * @off Disabled
 * @desc Is this popup enabled?
 * @default true
 *
 * @param Image
 * @text Custom Image
 *
 * @param filename:str
 * @text Filename
 * @parent Image
 * @type file
 * @dir img/system/
 * @require 1
 * @desc Select an image from img/system/ to use as a custom image
 * popup. If you use this, ignore the Render settings.
 * @default
 *
 * @param AnimationID:num
 * @text Animation ID
 * @parent Animation
 * @type animation
 * @desc Play this animation when weakness effect activates.
 * Requires VisuMZ_0_CoreEngine.
 * @default 0
 *
 * @param AniMirror:eval
 * @text Mirror Animation
 * @parent AnimationID:num
 * @type boolean
 * @on Mirror
 * @off Normal
 * @desc Mirror the weakness effect animation?
 * Requires VisuMZ_0_CoreEngine.
 * @default false
 *
 * @param AniMute:eval
 * @text Mute Animation
 * @parent AnimationID:num
 * @type boolean
 * @on Mute
 * @off Normal
 * @desc Mute the weakness effect animation?
 * Requires VisuMZ_0_CoreEngine.
 * @default false
 *
 * @param Render
 *
 * @param text:str
 * @text Text
 * @parent Render
 * @desc Type in the text you want displayed for the popup.
 * @default Text!
 *
 * @param bitmapWidth:num
 * @text Bitmap Width
 * @parent Render
 * @type number
 * @min 1
 * @desc What is the maximum width of this popup?
 * @default 600
 *
 * @param bitmapHeight:num
 * @text Bitmap Height
 * @parent Render
 * @type number
 * @min 1
 * @desc What is the maximum height of this popup?
 * @default 200
 *
 * @param fontFace:str
 * @text Font Name
 * @parent Render
 * @desc What font do you wish to use for this popup?
 * @default Impact
 *
 * @param fontSize:num
 * @text Font Size
 * @parent fontFace:str
 * @type number
 * @min 1
 * @desc What's the font size to use for the popup text?
 * @default 48
 *
 * @param fontBold:eval
 * @text Bold?
 * @parent fontFace:str
 * @type boolean
 * @on Bold
 * @off Normal
 * @desc Do you wish to make the text bold?
 * @default true
 *
 * @param fontItalic:eval
 * @text Italic?
 * @parent fontFace:str
 * @type boolean
 * @on Italic
 * @off Normal
 * @desc Do you wish to make the text italic?
 * @default false
 *
 * @param textColor:str
 * @text Text Color
 * @parent Render
 * @desc Use #rrggbb for custom colors or regular numbers
 * for text colors from the Window Skin.
 * @default 2
 *
 * @param outlineSize:num
 * @text Outline Size
 * @parent Render
 * @type number
 * @min 0
 * @desc What size do you want to use for the outline?
 * @default 5
 *
 * @param outlineColor:str
 * @text Outline Color
 * @parent outlineSize:num
 * @desc Colors with a bit of alpha settings.
 * Format rgba(0-255, 0-255, 0-255, 0-1)
 * @default rgba(0, 0, 0, 1)
 *
 * @param Offset
 *
 * @param offsetX:num
 * @text Offset: X
 * @parent Offset
 * @desc How much do you wish to offset the X position by?
 * @default 0
 *
 * @param offsetXvariance:num
 * @text Variance
 * @type number
 * @parent offsetX:num
 * @desc How much variance should be given to offset X?
 * @default 0
 *
 * @param offsetY:num
 * @text Offset: Y
 * @parent Offset
 * @desc How much do you wish to offset the Y position by?
 * @default 0
 *
 * @param offsetYvariance:num
 * @text Variance
 * @type number
 * @parent offsetY:num
 * @desc How much variance should be given to offset Y?
 * @default 0
 *
 * @param Scale
 *
 * @param scaleDuration:num
 * @text Duration
 * @parent Scale
 * @type number
 * @min 1
 * @desc How many frames should it take the scaling to reach the target scale?
 * @default 20
 *
 * @param startScaleX:num
 * @text Starting Scale: X
 * @parent Scale
 * @desc What scale X value should the popup start at?
 * @default 2.0
 *
 * @param startScaleY:num
 * @text Starting Scale: Y
 * @parent Scale
 * @desc What scale Y value should the popup start at?
 * @default 2.0
 *
 * @param targetScaleX:num
 * @text Target Scale: X
 * @parent Scale
 * @desc What scale X value should the popup end at?
 * @default 1.0
 *
 * @param targetScaleY:num
 * @text Target Scale: Y
 * @parent Scale
 * @desc What scale Y value should the popup end at?
 * @default 1.0
 *
 * @param Acceleration
 *
 * @param startSpeedX:num
 * @text Starting Speed: X
 * @parent Acceleration
 * @desc How much should the starting X speed of the popup be?
 * Negative: Left, Positive: Right
 * @default 0
 *
 * @param startSpeedY:num
 * @text Starting Speed: Y
 * @parent Acceleration
 * @desc How much should the starting Y speed of the popup be?
 * Negative: Up, Positive: Down
 * @default 0
 *
 * @param deltaSpeedX:num
 * @text Delta Speed: X
 * @parent Acceleration
 * @desc How much should the growing X speed of the popup be?
 * Negative: Left, Positive: Right
 * @default -0.10
 *
 * @param deltaSpeedY:num
 * @text Delta Speed: Y
 * @parent Acceleration
 * @desc How much should the growing Y speed of the popup be?
 * Negative: Up, Positive: Down
 * @default 0
 *
 * @param Fading
 *
 * @param opaqueDuration:num
 * @text Opaque Duration
 * @parent Fading
 * @type number
 * @min 1
 * @desc How many frames should the popup stay opaque?
 * @default 40
 *
 * @param fadeDuration:num
 * @text Fade Duration
 * @parent Fading
 * @type number
 * @min 1
 * @desc After the opaque duration wears off, how many frames will
 * it take for the popup to vanish?
 * @default 20
 */

(() => {
  const defaultParams = {
    StatePunisherSuccess: {
      General: "",
      enabled: true,
      Image: "",
      filename: "",
      Render: "",
      text: "WEAKNESS!",
      bitmapWidth: 600,
      bitmapHeight: 200,
      fontFace: "Impact",
      fontSize: 48,
      fontBold: true,
      fontItalic: false,
      textColor: "#ed1c24",
      outlineSize: "5",
      outlineColor: "rgba(0, 0, 0, 1.0)",
      Offset: "",
      offsetX: 0,
      offsetY: 0,
      Scale: "",
      scaleDuration: 20,
      startScaleX: 2.0,
      startScaleY: 2.0,
      targetScaleX: 1.0,
      targetScaleY: 1.0,
      Acceleration: "",
      startSpeedX: 0,
      startSpeedY: 0,
      deltaSpeedX: -0.05,
      deltaSpeedY: 0,
      Fading: "",
      opaqueDuration: 40,
      fadeDuration: 20,
    },
    StatePunisherFailure: {
      General: "",
      enabled: true,
      Image: "",
      filename: "",
      Render: "",
      text: "RESIST!",
      bitmapWidth: 600,
      bitmapHeight: 200,
      fontFace: "Impact",
      fontSize: 46,
      fontBold: true,
      fontItalic: false,
      textColor: "#82ca9c",
      outlineSize: 5,
      outlineColor: "rgba(0, 0, 0, 1.0)",
      Offset: "",
      offsetX: 0,
      offsetY: 0,
      Scale: "",
      scaleDuration: 20,
      startScaleX: 2.0,
      startScaleY: 2.0,
      targetScaleX: 1.0,
      targetScaleY: 1.0,
      Acceleration: "",
      startSpeedX: 0,
      startSpeedY: 0,
      deltaSpeedX: -0.05,
      deltaSpeedY: 0,
      Fading: "",
      opaqueDuration: 40,
      fadeDuration: 20,
    },
  };

  const params = PluginManager.parameters("FinisherWeaknessPopup");

  Object.assign(VisuMZ.WeaknessPopups.Settings, { ...defaultParams, ...VisuMZ.ConvertParams({}, params) });

  Game_Action.prototype.createWeaknessPopups = function (actor, damages) {
    if (!SceneManager.isSceneBattle()) {
      return;
    }
    if (!this.isDamage() && !this.isDrain()) {
      return;
    }

    // Original popups
    this.createWeaknessPopupsForElementRate(actor, damages);
    this.createWeaknessPopupsForCritical(actor, damages);

    const skill = this.item();

    const formula = skill.damage.formula;

    const regexp = /b\.isStateAffected\(([0-9]+)\)/;

    if (!formula.match(regexp)) {
      return;
    }

    const stateId = parseInt(formula.match(regexp)[1]);

    if (actor.isStateAffected(stateId)) {
      SceneManager._scene._spriteset.createWeaknessPopupType(actor, "StatePunisherSuccess");
    } else {
      SceneManager._scene._spriteset.createWeaknessPopupType(actor, "StatePunisherFailure");
    }
  };
})();
