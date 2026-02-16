//=============================================================================
// BattleSpeed.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Allow to speed up battle animations up to x4
 * @author Rachnera
 */

(() => {
  // TODO It would be nice to be able to change this variable directly from the plugin manager
  const maxBattleSpeed = 4;
  const battleSpeedMenuText = "Combat speed";

  let battleSpeed = 1;

  /* Code to load and save battle speed alongside the other options */

  const battleSpeedSymbol = "battleSpeed";

  Object.defineProperty(ConfigManager, battleSpeedSymbol, {
    get: function () {
      return battleSpeed;
    },
    set: function (value) {
      battleSpeed = value;
    },
    configurable: true,
  });

  const alias_Rachnera_BattleSpeed_ConfigManager_makeData = ConfigManager.makeData;
  ConfigManager.makeData = function () {
    const config = alias_Rachnera_BattleSpeed_ConfigManager_makeData.call(this);
    config[battleSpeedSymbol] = battleSpeed;
    return config;
  };

  const alias_Rachnera_BattleSpeed_ConfigManager_applyData = ConfigManager.applyData;
  ConfigManager.applyData = function (config) {
    alias_Rachnera_BattleSpeed_ConfigManager_applyData.call(this, config);
    battleSpeed = 1;
    if (battleSpeedSymbol in config) {
      battleSpeed = Number(config[battleSpeedSymbol]).clamp(1, maxBattleSpeed);
    }
  };

  /* Code to have battle speed show up in the options menu (and be configurable there) */

  const alias_Rachnera_BattleSpeed_Window_Options_makeCommandList = Window_Options.prototype.makeCommandList;
  Window_Options.prototype.makeCommandList = function () {
    alias_Rachnera_BattleSpeed_Window_Options_makeCommandList.call(this);
    this.addCommand(battleSpeedMenuText, battleSpeedSymbol);
  };

  const alias_Rachnera_BattleSpeed_Window_Options_statusText = Window_Options.prototype.statusText;
  Window_Options.prototype.statusText = function (index) {
    const symbol = this.commandSymbol(index);

    if (symbol === battleSpeedSymbol) {
      return `x${this.getConfigValue(symbol)}`;
    }

    return alias_Rachnera_BattleSpeed_Window_Options_statusText.call(this, index);
  };

  const alias_Rachnera_BattleSpeed_Window_Options_processOk = Window_Options.prototype.processOk;
  Window_Options.prototype.processOk = function () {
    const symbol = this.commandSymbol(this.index());

    if (symbol === battleSpeedSymbol) {
      const value = this.getConfigValue(symbol);
      if (value === maxBattleSpeed) {
        return this.changeValue(symbol, 1);
      }
      return this.changeValue(symbol, value + 1);
    }

    return alias_Rachnera_BattleSpeed_Window_Options_processOk.call(this);
  };

  const alias_Rachnera_BattleSpeed_Window_Options_cursorRight = Window_Options.prototype.cursorRight;
  Window_Options.prototype.cursorRight = function () {
    const symbol = this.commandSymbol(this.index());

    if (symbol === battleSpeedSymbol) {
      const value = this.getConfigValue(symbol);
      if (value === maxBattleSpeed) {
        return;
      }
      return this.changeValue(symbol, value + 1);
    }

    return alias_Rachnera_BattleSpeed_Window_Options_cursorRight.call(this);
  };

  const alias_Rachnera_BattleSpeed_Window_Options_cursorLeft = Window_Options.prototype.cursorLeft;
  Window_Options.prototype.cursorLeft = function () {
    const symbol = this.commandSymbol(this.index());

    if (symbol === battleSpeedSymbol) {
      const value = this.getConfigValue(symbol);
      if (value === 1) {
        return;
      }
      return this.changeValue(symbol, value - 1);
    }

    return alias_Rachnera_BattleSpeed_Window_Options_cursorLeft.call(this);
  };

  /* The bit of code that actually does the speed up */

  const alias_Rachnera_BattleSpeed_Scene_Battle_update = Scene_Battle.prototype.update;
  Scene_Battle.prototype.update = function () {
    if (BattleManager.isInputting() || $gameMessage.isBusy() || battleSpeed <= 1) {
      return alias_Rachnera_BattleSpeed_Scene_Battle_update.call(this);
    }

    for (let i = 1; i <= battleSpeed; i++) {
      alias_Rachnera_BattleSpeed_Scene_Battle_update.call(this);
      SceneManager.updateEffekseer();
    }
  };
})();
