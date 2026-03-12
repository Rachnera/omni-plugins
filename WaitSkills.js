//=============================================================================
// WaitSkills.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Notetags to make "wait" skills
 * @author Rachnera
 * @help
 * All notetags are to be added to the relevant skills
 *
 * To wait until the end of the next action:
 * <WaitOneAction>
 */

(() => {
  let actorToMove = null;

  const waitOneAction = (actor) => {
    actorToMove = actor;
  };

  const moveIfNeeded = () => {
    if (!actorToMove) {
      return;
    }

    actorToMove.setTurnOrderCTB(1);
    actorToMove = null;
  };

  const alias_BattleManager_selectNextActor = BattleManager.selectNextActor;
  BattleManager.selectNextActor = function () {
    moveIfNeeded();

    alias_BattleManager_selectNextActor.call(this);
  };

  const alias_BattleManager_processTurn = BattleManager.processTurn;
  BattleManager.processTurn = function () {
    moveIfNeeded();

    alias_BattleManager_processTurn.call(this);
  };

  const alias_BattleManager_endAction = BattleManager.endAction;
  BattleManager.endAction = function () {
    if (this._action?.item()?.note?.match(/<WaitOneAction>/g)) {
      waitOneAction(this._subject);
    }

    alias_BattleManager_endAction.call(this);
  };

  const alias_BattleManager_endBattle = BattleManager.endBattle;
  BattleManager.endBattle = function (result) {
    actorToMove = null; // Security cleanup

    alias_BattleManager_endBattle.call(this, result);
  };
})();
