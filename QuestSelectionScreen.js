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
 * Plugin Command -> QuestSelectionScreen -> Open Screen to show the menu
 *
 * Dependent on VisuStella Core for auto text wrapping. No other dependency.
 */

const Omnipocalypse_QuestsData = (() => {
  const doneWithAlice = () => {
    // Chased off Alice OFF or Finished Alice OFF
    return $gameSwitches.value(264) || $gameSwitches.value(269);
  };

  return [
    {
      name: "Robot horde in the parking lot",
      description: "The robot enemies are proliferating in a nearby parking lot and could become a threat.",
      availableIf: () => {
        // Second Wave Missions ON and Susie Boss OFF
        return $gameSwitches.value(243) && !$gameSwitches.value(200);
      },
    },
    {
      name: "Retake the radio tower",
      description: "We need to retake the radio tower, if we can find a pair of teams to clear the way.",
      availableIf: () => {
        return !$gameSwitches.value(380); // Radio Tower Done OFF
      },
      lockedIf: () => {
        // Less than four people in party, MC included
        return $gameParty.size() < 4;
      },
    },
    {
      name: "Retake the bridge",
      description: "You think you're ready to retake the bridge? Retreat might be difficult once we attract attention.",
      availableIf: () => {
        return !$gameSwitches.value(400); // Bridge Done OFF
      },
      lockedIf: () => {
        return $gameSwitches.value(386); // Bridge Failed ON
      },
    },
    {
      name: "Investigate strange zombies",
      description: "We'd welcome anyone who can go out and investigate these strange new zombies.",
      availableIf: () => {
        // Second Wave Missions ON and Have met Alice OFF and not done with Alice (cf doneWithAlice function definition above)
        return $gameSwitches.value(243) && !$gameSwitches.value(279) && !doneWithAlice();
      },
    },
    {
      name: "Find Alice",
      description:
        "Anderson hasn't officially given the mission yet, but there's nothing stopping us from going to find Alice.",
      availableIf: () => {
        // Have met Alice ON and not done with Alice
        return $gameSwitches.value(279) && !doneWithAlice();
      },
    },

    {
      name: "Always available",
      availableIf: () => {
        return true;
      },
    },
    {
      name: "Always available but also always locked",
      availableIf: () => {
        return true;
      },
      lockedIf: () => {
        return true;
      },
    },
  ];
})();

(() => {
  PluginManager.registerCommand("QuestSelectionScreen", "Open Screen", () => {
    SceneManager.push(Scene_QuestSelection);
  });

  const selectionBoxWidth = 360;
  const selectionBoxMaxLines = 6;

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
    const data = Omnipocalypse_QuestsData.filter((quest) => !!quest.availableIf && quest.availableIf());

    this._selectWindow = new Window_QuestSelection(data, (item) => {
      this._descriptionWindow.setItem(item);
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

    const lines = Math.min(selectionBoxMaxLines, data.length);
    const height = (this.lineHeight() + 12) * lines + 12;
    const rect = new Rectangle(0, (Graphics.boxHeight - height) / 2, selectionBoxWidth, height);

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
    if (item.lockedIf) {
      return !item.lockedIf();
    }

    return true;
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
    const marginLeft = 12;
    const rect = new Rectangle(
      selectionBoxWidth + marginLeft,
      0,
      Graphics.boxWidth - selectionBoxWidth - marginLeft,
      Graphics.boxHeight,
    );

    Window_Base.prototype.initialize.call(this, rect);
  };

  Window_QuestDescription.prototype.setItem = function (item) {
    this._item = item;
    this.refresh();
  };

  Window_QuestDescription.prototype.refresh = function () {
    this.contents.clear();

    if (!this._item) {
      return;
    }

    const text = this._item.description || "Missing mission description";
    const marginLeft = 8;

    this.drawTextEx("<WordWrap>" + text, marginLeft, 0, this.innerWidth - marginLeft);
  };
})();
