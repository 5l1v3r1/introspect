(function() {

  var MAX_SIZE = (100 << 20);

  function App() {
    this._uploadScene = new window.UploadScene();
    this._uploadScene.onUpload = this._handleUpload.bind(this);
  }

  App.prototype._handleUpload = function(files) {
    if (files.length !== 1) {
      alert('must upload exactly one file');
      return;
    }
    if (files[0].size > MAX_SIZE) {
      alert('file size is too large: ' + files[0].size);
      return;
    }
    var reader = new FileReader();
    reader.addEventListener('load', function() {
      var contents = reader.result;
      this._handleContents(contents);
    }.bind(this));
    reader.addEventListener('error', function() {
      alert('failed to read file');
      return;
    });
    reader.readAsArrayBuffer(files[0]);
  };

  App.prototype._handleContents = function(contents) {
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
