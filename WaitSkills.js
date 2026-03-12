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
 * <JS Command Visible>
 *   visible = $gameParty.size() > 1;
 * </JS>
 */

(() => {
  let actorToMove = null;
  let targetTurn = null;

  const waitOneAction = (actor) => {
    actorToMove = actor;
    targetTurn = 1;
  };

  const waitForNextAlly = (actor) => {
    actorToMove = actor;
    targetTurn = SceneManager._scene._ctbTurnOrderWindow._turnOrderContainer.findIndex(
      (sprite) => sprite.battler() instanceof Game_Actor && sprite.battler()._actorId !== actor._actorId,
    );

    // Abort ship if couldn't find a position to move to
    if (!targetTurn) {
      cleanup();
    }
  };

  const moveIfNeeded = () => {
    if (!actorToMove) {
      return;
    }

    actorToMove.setTurnOrderCTB(targetTurn);
    cleanup();
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

    if (notetag?.match(/<WaitOneAction>/g)) {
      waitOneAction(this._subject);
    }

    if (notetag?.match(/<WaitForNextAlly>/g)) {
      waitForNextAlly(this._subject);
    }

    alias_BattleManager_endAction.call(this);
  };

  const alias_BattleManager_endBattle = BattleManager.endBattle;
  BattleManager.endBattle = function (result) {
    cleanup(); // Security cleanup

    alias_BattleManager_endBattle.call(this, result);
  };

  const cleanup = () => {
    actorToMove = null;
    targetTurn = null;
  };
})();
