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
(function() {

  var MAX_SIZE = (100 << 20);

  function UploadScene() {
    this.onUpload = null;

    $('#upload-button').click(this._showPicker.bind(this));
    this._registerDragging();
  }

  UploadScene.prototype.show = function() {
    document.body.className = 'uploading';
  };

  UploadScene.prototype._showPicker = function() {
    var fakeInput = $('<input type="file">').css({visibility: 'hidden'});
    fakeInput.on('change', function(e) {
      this._handleFiles(e.target.files);
    }.bind(this));
    fakeInput.click();
  };

  UploadScene.prototype._registerDragging = function() {
    if ('undefined' === typeof window.File) {
      return;
    }

    var scene = $('#upload-scene');
    var dropButton = $('#upload-button');
    var regularLabel = dropButton.text();

    var dropZone = $('<div></div>').css({
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      display: 'none'
    });
    $(document.body).append(dropZone);

    $(window).on('dragover', function(e) {
      e.preventDefault();
      e.stopPropagation();
      dropZone.css({display: 'block'});
      scene.addClass('dragging');
      dropButton.text('Drop File');
    });
    dropZone.on('dragleave', function(e) {
      e.preventDefault();
      e.stopPropagation();
      dropZone.css({display: 'none'});
      scene.removeClass('dragging');
      dropButton.text(regularLabel);
    });
    dropZone.on('drop dragdrop', function(e) {
      e.preventDefault();
      dropZone.css({display: 'none'});
      scene.removeClass('dragging');
      dropButton.text(regularLabel);
      this._handleFiles(e.originalEvent.dataTransfer.files);
    }.bind(this));
  };

  UploadScene.prototype._handleFiles = function(files) {
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
      if (this.onUpload) {
        this.onUpload(new window.Uint8Array(contents));
      }
    }.bind(this));
    reader.addEventListener('error', function() {
      alert('failed to read file');
      return;
    });
    reader.readAsArrayBuffer(files[0]);
  };

  window.UploadScene = UploadScene;

})();
