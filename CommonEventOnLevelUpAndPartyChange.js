//=============================================================================
// CommonEventOnLevelUpAndPartyChange.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Call specified common event on level up and people being added/removed from party
 * @author Rachnera
 *
 * @param Common Event Id
 * @desc Id of the common Event to be played
 * @default 0
 *
 * @help
 * Make sure the common event can be run several times consecutively without
 * side effects (no player transfer for example) as this will happen often:
 * several characters gaining a level during the same battle, one character
 * gaining several levels, etc.
 */

(() => {
  const params = PluginManager.parameters("CommonEventOnLevelUpAndPartyChange");
  const commonEventToCall = parseInt(params["Common Event Id"]);

  const runCommonEvent = () => {
    if (!commonEventToCall) {
      return;
    }

    $gameTemp.reserveCommonEvent(commonEventToCall);
  };

  const alias_Game_Actor_levelUp = Game_Actor.prototype.levelUp;
  Game_Actor.prototype.levelUp = function (exp, show) {
    alias_Game_Actor_levelUp.call(this, exp, show);
    runCommonEvent();
  };

  const alias_Game_Party_addActor = Game_Party.prototype.addActor;
  Game_Party.prototype.addActor = function (actorId) {
    alias_Game_Party_addActor.call(this, actorId);
    runCommonEvent();
  };

  const alias_Game_Party_removeActor = Game_Party.prototype.removeActor;
  Game_Party.prototype.removeActor = function (actorId) {
    alias_Game_Party_removeActor.call(this, actorId);
    runCommonEvent();
  };
})();
