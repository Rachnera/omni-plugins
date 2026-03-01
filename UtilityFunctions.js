//=============================================================================
// UtilityFunctions.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Various pieces of code to be called through the Script command
 * @author Rachnera
 * @help
 * =====
 * instaWinBattle(troopId): Call the code to trigger a battle against the troop
 * with the given id, immediately kill all enemies, and award rewards but
 * without ever showing any battle-related screen.
 * If VisuStella MZ - Gab Window is enabled, messages will be print in the Gab
 * Window instead of the standard one.
 * =====
 */

const instaWinBattle = (troopId) => {
  if (GameMessageHacks.gabAvailable) {
    GameMessageHacks.pipeIntoGab();
  }

  BattleManager.setup(troopId);
  $gameTroop.members().forEach((enemy) => enemy.addNewState(1));
  BattleManager.makeRewards();
  BattleManager.displayRewards();
  BattleManager.gainRewards();
  BattleManager.endBattle(0);

  if (GameMessageHacks.gabAvailable) {
    GameMessageHacks.restoreDefaults();
  }
};

const GameMessageHacks = {};

(() => {
  let pipeGameMessageIntoGap = false;
  let gabBuffer = [];

  const alias_Game_Message_add = Game_Message.prototype.add;
  Game_Message.prototype.add = function (text) {
    if (!pipeGameMessageIntoGap) {
      return alias_Game_Message_add.call(this, text);
    }

    gabBuffer.push(text);
  };

  const alias_Game_Message_newPage = Game_Message.prototype.newPage;
  Game_Message.prototype.newPage = function () {
    if (!pipeGameMessageIntoGap) {
      return alias_Game_Message_newPage.call(this);
    }

    GameMessageHacks.printGab();
  };

  GameMessageHacks.gabAvailable = !!$plugins.find(function (plugin) {
    return plugin.status && plugin.description.includes("[GabWindow]");
  });

  GameMessageHacks.pipeIntoGab = () => {
    pipeGameMessageIntoGap = true;
  };

  GameMessageHacks.printGab = () => {
    if (gabBuffer.length === 0) {
      return;
    }

    SceneManager._scene.startGabWindow({
      Text: "<WordWrap>" + gabBuffer.join("\n") + "</WordWrap>",
      Override: { WaitTime: 30, TimePerCharacter: 0.25 },
    });

    gabBuffer = [];
  };

  GameMessageHacks.restoreDefaults = () => {
    GameMessageHacks.printGab();

    pipeGameMessageIntoGap = false;
  };
})();
