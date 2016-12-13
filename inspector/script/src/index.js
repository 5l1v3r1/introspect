(function() {

  function App() {
    this._uploadScene = new window.UploadScene();
    this._uploadScene.onUpload = this._handleUpload.bind(this);
    this._uploadScene.show();
  }

  App.prototype._handleUpload = function(contents) {
    var edit = new window.EditScene(contents);
    edit.onExit = this._uploadScene.show.bind(this);
    edit.show();
  };

  window.addEventListener('load', function() {
    new App();
  });

})();
