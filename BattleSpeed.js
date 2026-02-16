
const alias_Rachnera_BattleSpeed_Scene_Battle_update = Scene_Battle.prototype.update;
Scene_Battle.prototype.update = function () {
  const battleSpeed = 4;

  if (BattleManager.isInputting() || $gameMessage.isBusy() || battleSpeed <= 1) {
    return alias_Rachnera_BattleSpeed_Scene_Battle_update.call(this);
  }

  for (let i = 1; i <= battleSpeed; i++) {
    alias_Rachnera_BattleSpeed_Scene_Battle_update.call(this);
    SceneManager.updateEffekseer();
  }
};
