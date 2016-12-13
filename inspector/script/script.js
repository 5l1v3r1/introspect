(function() {

  function EditScene(contents) {
    this._animating = false;
    var obj = window.deserializeObject(contents);
    this._stack = [];
    if (!window.paneRegistry.hasOwnProperty(obj.type)) {
      this._stack.push(new UnsupportedPane(obj.type));
    } else {
      var paneClass = window.paneRegistry[obj.type];
      this._stack.push(new paneClass(obj));
    }
    $('#back-button').click(this._back.bind(this));
  }

  EditScene.prototype.show = function() {
    document.body.className = 'editing';
    this._animating = true;
    this._stack[0].show(function() {
      this._animating = false;
      this._stack[0].onPush = this._push.bind(this);
    }.bind(this));
  };

  EditScene.prototype._push = function(pane) {
    var current = this._stack[this._stack.length-1];
    current.onPush = function() {};
    this._stack.push(pane);
    this._animating = true;

    if (this._stack.length > 1) {
      $('#back-button').removeClass('hidden');
    }

    current.hide(function() {
      pane.show(function() {
        pane.onPush = this._push.bind(this);
        this._animating = false;
      }.bind(this));
    }.bind(this));
  };

  EditScene.prototype._back = function() {
    if (this._animating || this._stack.length === 1) {
      return;
    }
    if (this._stack.length === 2) {
      $('#back-button').addClass('hidden');
    }
    this._animating = true;
    var removing = this._stack[this._stack.length-1];
    removing.onPush = function() {};
    removing.hide(function() {
      this._stack.pop();
      var latest = this._stack[this._stack.length-1];
      latest.show(function() {
        latest.onPush = this._push.bind(this);
        this._animating = false;
      }.bind(this));
    }.bind(this));
  };

  function EditorPane() {
    this.onPush = function() {};
    this.element = $('<div class="pane hidden"></div>');
  }

  EditorPane.prototype.hide = function(cb) {
    this.element.addClass('hidden');
    this.element.one('webkitTransitionEnd transitionend', function() {
      this.element.detach();
      cb();
      // Prevent duplicate callbacks.
      cb = function() {};
    }.bind(this));
  };

  EditorPane.prototype.show = function(cb) {
    $('#edit-scene').append(this.element);
    setTimeout(function() {
      this.element.removeClass('hidden');
      this.element.one('webkitTransitionEnd transitionend', function() {
        cb();
        // Prevent duplicate callbacks.
        cb = function() {};
      }.bind(this));
    }.bind(this), 100);
  };

  function UnsupportedPane(name) {
    EditorPane.call(this);
    this.element.append($('<h1></h1>').text('Unsupported type: ' + name));
    this.element.addClass('unsupported-pane');

    this.element.click(function() {
      this.onPush(new UnsupportedPane('yo ' + name));
    }.bind(this));
  }

  UnsupportedPane.prototype = Object.create(EditorPane.prototype);
  UnsupportedPane.prototype.constructor = UnsupportedPane;

  window.EditScene = EditScene;
  window.EditorPane = EditorPane;

})();
(function() {

  function App() {
    this._uploadScene = new window.UploadScene();
    this._uploadScene.onUpload = this._handleUpload.bind(this);
  }

  App.prototype._handleUpload = function(contents) {
    var edit = new window.EditScene(contents);
    edit.show();
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
