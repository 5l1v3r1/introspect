(function() {

  function EditScene(contents) {
    // TODO: set things up here.
    this._contents = contents;
  }

  EditScene.prototype.show = function() {
    document.body.className = 'editing';
    // TODO: populate edit scene here.
  };

  window.EditScene = EditScene;

})();
