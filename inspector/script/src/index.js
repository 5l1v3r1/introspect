(function() {

  function App() {
    this._uploadScene = new window.UploadScene();
    this._uploadScene.onUpload = this._handleUpload.bind(this);
  }

  App.prototype._handleUpload = function(contents) {
    try {
      var edit = new window.EditScene(contents);
      edit.show();
    } catch (e) {
      alert('failed to process contents: ' + e);
    }
  };

  window.addEventListener('load', function() {
    new App();
  });

})();
