//=============================================================================
// FinisherWeaknessPopup.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Transform VS Weakness Popups to interact with states and punishers.
 * @author Rachnera
 *
 * @help
 * Depends on VisuStella MZ - Weakness Popups.
 *
 * Disables VS default critical/elemental popups.
 *
 * Display VS "Element Rate >= 200%" (Weakness!) when using a punisher skill
 * against an enemy with the right status and "Element Rate <= 25%" (Resist!)
 * if the enemy has not properly prepared.
 */

(() => {
  Game_Action.prototype.createWeaknessPopups = function (actor, damages) {
    if (!SceneManager.isSceneBattle()) {
      return;
    }
    if (!this.isDamage() && !this.isDrain()) {
      return;
    }

    // Original popups, now disabled
    // this.createWeaknessPopupsForElementRate(actor, damages);
    // this.createWeaknessPopupsForCritical(actor, damages);

    const skill = this.item();

    const formula = skill.damage.formula;

    const regexp = /b\.isStateAffected\(([0-9]+)\)/;

    if (!formula.match(regexp)) {
      return;
    }

    const stateId = parseInt(formula.match(regexp)[1]);

    if (actor.isStateAffected(stateId)) {
      SceneManager._scene._spriteset.createWeaknessPopupType(actor, "Element200");
    } else {
      SceneManager._scene._spriteset.createWeaknessPopupType(actor, "Element25");
    }
  };
})();
