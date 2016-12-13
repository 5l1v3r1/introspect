(function() {

  function EditScene(contents) {
    // TODO: set things up here.
    var obj = window.deserializeObject(contents);
    console.log('obj is', obj);
  }

  EditScene.prototype.show = function() {
    document.body.className = 'editing';
    // TODO: populate edit scene here.
  };

  window.EditScene = EditScene;

})();
