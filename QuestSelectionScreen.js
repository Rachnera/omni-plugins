//=============================================================================
// QuestSelectionScreen.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Provide a (relatively standard) selection screen for quests
 * @author Rachnera
 *
 * @command Open Screen
 * @desc Show the quest selection menu
 *
 * @help
 * To show the menu:
 * Plugin Command -> QuestSelectionScreen -> Open Screen
 *
 * Require QuestSelectionScreen_Data plugin to work:
 * - Rename or copy-paste QuestSelectionScreen_Data.js.example as
 *   QuestSelectionScreen_Data.js
 * - Enable it as any plugin
 * - Edit it as much as you need/like
 *
 * Dependent on VisuStella Core for auto text wrapping and other text features.
 * https://www.yanfly.moe/wiki/Category:Text_Codes_(MZ)#Message_Core_Hard-Coded_Text_Codes
 * No other dependency.
 */

(() => {
  PluginManager.registerCommand("QuestSelectionScreen", "Open Screen", () => {
    SceneManager.push(Scene_QuestSelection);
  });

  const selectionBoxWidth = 360;
  const selectionBoxHeight = 204;
  const descriptionBoxWidth = 480;

  function Scene_QuestSelection() {
    this.initialize(...arguments);
  }

  Scene_QuestSelection.prototype = Object.create(Scene_MenuBase.prototype);
  Scene_QuestSelection.prototype.constructor = Scene_QuestSelection;

  Scene_QuestSelection.prototype.initialize = function () {
    Scene_MenuBase.prototype.initialize.call(this);
  };

  Scene_QuestSelection.prototype.create = function () {
    Scene_MenuBase.prototype.create.call(this);

    // Hide VisuStella core button help
    this._buttonAssistWindow.hide();

    this.createDescriptionWindow();
    this.createSelectWindow();
  };

  Scene_QuestSelection.prototype.createSelectWindow = function () {
    const data = Omnipocalypse_QuestsData.filter((quest) => !!quest.availableIf && quest.availableIf()).map((data) => {
      return {
        ...data,
        locked: !data.commonEventId || (data.lockedIf && data.lockedIf()),
      };
    });

    this._selectWindow = new Window_QuestSelection(data, (item) => {
      this._descriptionWindow.setItem(item);
    });
    this._selectWindow.setHandler("ok", () => {
      $gameTemp.reserveCommonEvent(this._selectWindow.item().commonEventId);
      this.popScene();
    });
    this._selectWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(this._selectWindow);
  };

  Scene_QuestSelection.prototype.createDescriptionWindow = function () {
    this._descriptionWindow = new Window_QuestDescription();
    this.addWindow(this._descriptionWindow);
  };

  function Window_QuestSelection() {
    this.initialize(...arguments);
  }

  Window_QuestSelection.prototype = Object.create(Window_Selectable.prototype);
  Window_QuestSelection.prototype.constructor = Window_QuestSelection;

  Window_QuestSelection.prototype.initialize = function (data, onSelect) {
    this._data = data;
    this._onSelect = onSelect;

    const rect = new Rectangle(
      Graphics.boxWidth - descriptionBoxWidth + (descriptionBoxWidth - selectionBoxWidth) / 2,
      0,
      selectionBoxWidth,
      selectionBoxHeight,
    );

    Window_Selectable.prototype.initialize.call(this, rect);

    this.refresh();
    this.activate();
    this.select(0);
  };

  Window_QuestSelection.prototype.maxItems = function () {
    return this._data.length;
  };

  Window_QuestSelection.prototype.item = function () {
    return this._data[this.index()];
  };

  Window_QuestSelection.prototype.isCurrentItemEnabled = function () {
    return this.isEnabled(this.item());
  };

  Window_QuestSelection.prototype.isEnabled = function (item) {
    return !item.locked;
  };

  Window_QuestSelection.prototype.refresh = function () {
    Window_Selectable.prototype.refresh.call(this);
  };

  Window_QuestSelection.prototype.drawItem = function (index) {
    const item = this._data[index];

    const rect = this.itemLineRect(index);
    const padding = 4;

    this.changePaintOpacity(this.isEnabled(item));
    this.drawText(item.name, rect.x + padding, rect.y, rect.width - padding);
    this.changePaintOpacity(true);
  };

  Window_QuestSelection.prototype.select = function (index) {
    Window_Selectable.prototype.select.call(this, index);
    this._onSelect(this._data[index]);
  };

  function Window_QuestDescription() {
    this.initialize(...arguments);
  }

  Window_QuestDescription.prototype = Object.create(Window_Base.prototype);
  Window_QuestDescription.prototype.constructor = Window_QuestDescription;

  Window_QuestDescription.prototype.initialize = function () {
    const marginTop = 8;

    const rect = new Rectangle(
      Graphics.boxWidth - descriptionBoxWidth,
      selectionBoxHeight + marginTop,
      descriptionBoxWidth,
      Graphics.boxHeight - selectionBoxHeight - marginTop,
    );

    Window_Base.prototype.initialize.call(this, rect);
  };

  Window_QuestDescription.prototype.setItem = function (item) {
    this._item = item;
    this.refresh();
  };

  Window_QuestDescription.prototype.refresh = function () {
    this.contents.clear();

    const item = this._item;
    if (!item) {
      return;
    }

    let text = item.description || "Missing mission description";

    if (item.locked) {
      let lockedText = item.lockedMessage;

      if (!item.commonEventId) {
        lockedText = "Locked due to missing a common event to execute on mission selection.";
      } else if (!item.lockedMessage) {
        lockedText = "Missing a message explaining why the mission cannot be proceeded with.";
      }

      text += "<br><br>" + "\\C[18]" + lockedText;
    }

    const marginLeft = 8;
    this.drawTextEx("<WordWrap>" + text, marginLeft, 0, this.innerWidth - marginLeft);
  };
})();
