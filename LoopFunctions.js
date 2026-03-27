//=============================================================================
// LoopFunctions.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Functions to make looping easier
 * @author Rachnera
 * @help
 * =====
 * resetAllNonPermSwitches()
 * Also exclude SKL switches
 * =====
 * resetAllNonPermVariables()
 * Also ignore switches 1-15
 * =====
 * resetAllItems()
 * =====
 */

const resetAllNonPermSwitches = () => {
  $gameSwitches._data
    .map((value, id) => {
      return { id, value, name: $dataSystem.switches[id] };
    })
    .filter(({ value, name }) => {
      // Ignore already OFF switches
      if (!value) {
        return false;
      }

      // Ignore PERM/SKL switches
      if (name.startsWith("PERM") || name.startsWith("SKL")) {
        return false;
      }

      return true;
    })
    .forEach(({ id }) => $gameSwitches.setValue(id, false));
};

const resetAllNonPermVariables = () => {
  $gameVariables._data
    .map((value, id) => {
      return { id, value, name: $dataSystem.variables[id] };
    })
    .filter(({ id, value, name }) => {
      // Ignore variables already at zero (and undefined)
      if (!value) {
        return false;
      }

      if (id <= 15) {
        return false;
      }

      if (name.startsWith("PERM")) {
        return false;
      }

      return true;
    })
    .forEach(({ id }) => $gameVariables.setValue(id, 0));
};

const resetAllItems = (includeEquip = true) => {
  [...$dataItems, ...$dataWeapons, ...$dataArmors].forEach((item) => $gameParty.gainItem(item, -999, includeEquip));
};
