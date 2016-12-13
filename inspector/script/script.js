(function() {

  function EditScene(contents) {
    this.onExit = null;

    this._animating = false;
    var obj = window.deserializeObject(contents);
    this._stack = [];
    if (!window.paneRegistry.hasOwnProperty(obj.type)) {
      this._stack.push(new UnsupportedPane(obj.type));
    } else {
      var paneClass = window.paneRegistry[obj.type];
      this._stack.push(new paneClass(obj.data));
    }
    $('#back-button').click(this._back.bind(this));
  }

  EditScene.prototype.show = function() {
    $('#back-button').addClass('hidden');
    document.body.className = 'editing';
    this._animating = true;
    this._stack[0].show(function() {
      this._animating = false;
      this._stack[0].onPush = this._push.bind(this);
    }.bind(this));
    setTimeout(function() {
      $('#back-button').removeClass('hidden');
    }, 100);
  };

  EditScene.prototype._push = function(pane) {
    var current = this._stack[this._stack.length-1];
    current.onPush = function() {};
    this._stack.push(pane);
    this._animating = true;

    current.hide(function() {
      pane.show(function() {
        pane.onPush = this._push.bind(this);
        this._animating = false;
      }.bind(this));
    }.bind(this));
  };

  EditScene.prototype._back = function() {
    if (this._animating) {
      return;
    }
    if (this._stack.length === 1) {
      $('#back-button').unbind('click').addClass('hidden');
      this._animating = true;
      this._stack[0].onPush = function() {};
      this._stack[0].hide(function() {
        this.onExit();
      }.bind(this));
      return;
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
  }

  UnsupportedPane.prototype = Object.create(EditorPane.prototype);
  UnsupportedPane.prototype.constructor = UnsupportedPane;

  window.paneRegistry = {};
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
    edit.onExit = this._uploadScene.show.bind(this);
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
    $('#upload-button').addClass('hidden');
    document.body.className = 'uploading';
    setTimeout(function() {
      $('#upload-button').removeClass('hidden');
    }, 100);
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
(function() {

  function LSTMPane(data) {
    window.EditorPane.call(this);
    var inValWeights = data[0];
    var inValBiases = data[1];
    var inGateWeights = data[2];
    var inGateBiases = data[3];
    var remGateWeights = data[4];
    var remGateBiases = data[5];
    var outGateWeights = data[6];
    var outGateBiases = data[7];
    var initState = data[8];
    var inValPeep = data[9];
    var inGatePeep = data[10];
    var remGatePeep = data[11];
    var outGatePeep = data[12];

    this._stateSize = initState.length;
    this._inSize = inValWeights.length/this._stateSize - this._stateSize;

    var matrices = [inValWeights, inGateWeights, remGateWeights, outGateWeights];
    var biases = [inValBiases, inGateBiases, remGateBiases, outGateBiases];
    var peeps = [inValPeep, inGatePeep, remGatePeep, outGatePeep];

    this.element.append(this._vecField('InitState', initState));

    var names = ['In Val.', 'In Gate', 'Rem. Gate', 'Out Gate'];
    for (var i = 0; i < 4; i++) {
      this.element.append(this._vecField(names[i]+' Bias', biases[i]));
      this.element.append(this._vecField(names[i]+' Peephole', peeps[i]));
      this.element.append(this._matField(names[i]+' Weights', matrices[i]));
    }
  }

  LSTMPane.prototype = Object.create(window.EditorPane.prototype);
  LSTMPane.prototype.constructor = LSTMPane;

  LSTMPane.prototype._vecField = function(name, vec) {
    var field = $('<div></div>').addClass('vec-field');
    field.append($('<label></label>').text(name));
    field.append($('<button></button>').click(function() {
      var pane = new window.VectorPane(vec);
      this.onPush(pane);
    }.bind(this)).text('Edit'));
    return field;
  };

  LSTMPane.prototype._matField = function(name, mat) {
    var field = $('<div></div>').addClass('mat-field');
    field.append($('<label></label>').text(name));
    field.append($('<button></button>').click(function() {
      var pane = new window.MatrixPane(this._stateSize,
        this._inSize+this._stateSize, mat);
      this.onPush(pane);
    }.bind(this)).text('Edit'));
    return field;
  };

  window.paneRegistry.LSTM = LSTMPane;

})();
(function() {

  function VectorPane(values) {
    window.EditorPane.call(this);
    this._values = values;
    this.element.append($('<label>TODO: vector here</label>'));
    // TODO: initialize UI here.
  }

  VectorPane.prototype = Object.create(window.EditorPane.prototype);
  VectorPane.prototype.constructor = VectorPane;

  function MatrixPane(rows, cols, values) {
    window.EditorPane.call(this);
    this._rows = rows;
    this._cols = cols;
    this._values = values;
    this.element.append($('<label>TODO: matrix here</label>'));
    // TODO: initialize UI here.
  }

  MatrixPane.prototype = Object.create(window.EditorPane.prototype);
  MatrixPane.prototype.constructor = MatrixPane;

  window.VectorPane = VectorPane;
  window.MatrixPane = MatrixPane;

})();
