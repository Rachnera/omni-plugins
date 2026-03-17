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
 *
 * To wait until the end of the next action taken by an ally:
 * <WaitForNextAlly>
 * Bonus: You likely also want to add the following tag so the skill doesn't
 * show up for parties of one:
 * <JS Skill Visible>
 *   visible = $gameParty.size() > 1;
 * </JS Skill Visible>
 *
 * To increase the duration of all ongoing states on the subject by one:
 * <AllStatesPlusOneTurn>
 * Important note: Already done by default when using one of the previous tags.
 * Provided if needed elsewhere, like for skills granting more actions.
 * Applied before the states are checked (and possibly removed) at the end
 * of the action.
 */

(() => {
  let actorToMove = null;
  let targetTurn = null;

  const waitOneAction = (actor) => {
    prepareWait(actor, 1);
  };

  const waitForNextAlly = (actor) => {
    prepareWait(
      actor,
      SceneManager._scene._ctbTurnOrderWindow._turnOrderContainer.findIndex(
        (sprite) => sprite.battler() instanceof Game_Actor && sprite.battler()._actorId !== actor._actorId,
      ),
    );
  };

  const prepareWait = (actor, turn) => {
    // Abort ship if anything is wrong
    if (!actor || !turn) {
      return cleanup();
    }

    actorToMove = actor;
    targetTurn = turn;

    increaseAllStateDurationsByOne(actor);
  };

  const increaseAllStateDurationsByOne = (actor) => {
    actor._states.forEach((stateId) => {
      actor.addStateTurns(stateId, 1);
    });
  };

  const moveIfNeeded = () => {
    if (!actorToMove) {
      return;
    }

    actorToMove.setTurnOrderCTB(targetTurn);
    cleanup();
  };

  const cleanup = () => {
    actorToMove = null;
    targetTurn = null;
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
    const notetag = this._action?.item()?.note;

    if (notetag?.match(/<WaitOneAction>/)) {
      waitOneAction(this._subject);
    }

    if (notetag?.match(/<WaitForNextAlly>/)) {
      waitForNextAlly(this._subject);
    }

    if (notetag?.match(/<AllStatesPlusOneTurn>/)) {
      increaseAllStateDurationsByOne(this._subject);
    }

    alias_BattleManager_endAction.call(this);
  };

  const alias_BattleManager_endBattle = BattleManager.endBattle;
  BattleManager.endBattle = function (result) {
    cleanup(); // Security cleanup

    alias_BattleManager_endBattle.call(this, result);
  };
})();
