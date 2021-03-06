(function() {

  function serializeAndDownload(obj) {
    var data = window.serializeObject(obj);
    if (!data) {
      alert('could not serialize');
      return;
    }
    var str = String.fromCharCode.apply(String, data);
    window.location = 'data:application/octet-stream;base64,' + btoa(str);
  }

  function downloadCode(code) {
    window.location = 'data:application/octet-stream;base64,' + btoa(code);
  }

  window.serializeAndDownload = serializeAndDownload;
  window.downloadCode = downloadCode;

})();
(function() {

  function EditScene(contents) {
    var obj = window.deserializeObject(contents);

    this.onExit = null;
    this._animating = false;
    this._stack = [paneForObject(obj)];

    $('#back-button').click(this._back.bind(this));
  }

  EditScene.prototype.show = function() {
    // Must hide back button before transitioning to
    // the 'editing' scene to ensure we get an animation.
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
    this._stack.push(pane);
    this._togglePane(current, pane);
  };

  EditScene.prototype._back = function() {
    if (this._animating) {
      return;
    }
    if (this._stack.length === 1) {
      this._exit();
      return;
    }
    this._animating = true;
    var removing = this._stack.pop();
    var replacement = this._stack[this._stack.length-1];
    this._togglePane(removing, replacement);
  };

  EditScene.prototype._exit = function() {
    $('#back-button').unbind('click').addClass('hidden');
    this._animating = true;
    this._stack[0].onPush = nop;
    this._stack[0].hide(function() {
      this.onExit();
    }.bind(this));
  };

  EditScene.prototype._togglePane = function(hide, show) {
    this._animating = true;
    hide.onPush = nop;
    hide.hide(function() {
      show.show(function() {
        this._animating = false;
        show.onPush = this._push.bind(this);
      }.bind(this));
    }.bind(this));
  };

  function EditorPane(title) {
    this.onPush = nop;
    this.element = $('<div class="pane hidden"></div>');

    if (title) {
      this.element.append($('<h1></h1>').text(title));
    }
  }

  EditorPane.prototype.addSaveButton = function(name, data) {
    var b = $('<button class="save-button">Save</button>');
    this.element.append(b);
    b.click(function() {
      window.serializeAndDownload({type: name, data: data});
    });
  };

  EditorPane.prototype.addCodeButton = function(onClick) {
    var b = $('<button class="code-button">Code</button>');
    this.element.append(b);
    b.click(onClick);
  };

  EditorPane.prototype.addEditField = function(name, click) {
    var button = $('<button class="edit-button">Edit</button>').click(click);
    var field = $('<div></div>').addClass('labeled-field');
    field.append($('<label></label>').text(name));
    field.append(button);
    this.element.append(field);
  };

  EditorPane.prototype.hide = function(cb) {
    this.element.addClass('hidden');
    this._waitTransition(cb);
  };

  EditorPane.prototype.show = function(cb) {
    $('#edit-scene').append(this.element);
    // Timeout necessary to ensure we get an animaiton.
    setTimeout(function() {
      this.element.removeClass('hidden');
      this._waitTransition(cb);
    }.bind(this), 100);
  };

  EditorPane.prototype._waitTransition = function(cb) {
    this.element.one('webkitTransitionEnd transitionend', function() {
      cb();
      // Prevent duplicate callbacks.
      cb = nop;
    }.bind(this));
  };

  function UnsupportedPane(name) {
    EditorPane.call(this, 'Unsupported: ' + name);
    this.element.addClass('unsupported-pane');
  }

  UnsupportedPane.prototype = Object.create(EditorPane.prototype);
  UnsupportedPane.prototype.constructor = UnsupportedPane;

  function nop() {
  }

  function paneForObject(obj) {
    if (!window.paneRegistry.hasOwnProperty(obj.type)) {
      return new UnsupportedPane(obj.type);
    }
    var paneClass = window.paneRegistry[obj.type];
    return new paneClass(obj.data);
  }

  window.paneRegistry = {};
  window.paneForObject = paneForObject;
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

  function ListPane(items, title) {
    window.EditorPane.call(this, title);
    for (var i = 0, len = items.length; i < len; ++i) {
      (function(item) {
        var field = $('<div></div>').addClass('labeled-field');
        field.append($('<label></label>').text(item.type));
        var button = $('<button class="edit-button">Edit</button>');
        field.append(button.click(function() {
          this.onPush(window.paneForObject(item));
        }.bind(this)));
        this.element.append(field);
      }.bind(this))(items[i]);
    }
  }

  ListPane.prototype = Object.create(window.EditorPane.prototype);
  ListPane.prototype.constructor = ListPane;

  window.ListPane = ListPane;

})();
(function() {

  function declareVector(name, values) {
    var strs = [];
    for (var i = 0, len = values.length; i < len; ++i) {
      strs[i] = values[i] + '';
    }
    var value = strs.join('; ');
    return name + ' = [' + value + '];';
  }

  function declareMatrix(name, rows, values) {
    var cols = values.length / rows;
    var rowStrs = [];
    for (var row = 0; row < rows; ++row) {
      var colStrs = [];
      for (var col = 0; col < cols; ++col) {
        colStrs[col] = values[col+row*cols] + '';
      }
      rowStrs[row] = colStrs.join(' ');
    }
    var value = rowStrs.join('; ');
    return name + ' = [' + value + '];';
  }

  window.octave = {
    declareVector: declareVector,
    declareMatrix: declareMatrix
  };

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

  function NetworkPane(data) {
    window.ListPane.call(this, data, 'Network');
    this.addSaveButton('Network', data);
  }

  NetworkPane.prototype = Object.create(window.ListPane.prototype);
  NetworkPane.prototype.constructor = NetworkPane;

  function DenseLayerPane(data) {
    window.EditorPane.call(this, 'DenseLayer');
    var outSize = data[1].length;
    var inSize = data[0].length / outSize;
    this.addEditField('Weights', function() {
      this.onPush(new window.MatrixPane(outSize, inSize, data[0]));
    }.bind(this));
    this.addEditField('Biases', function() {
      this.onPush(new window.VectorPane(data[1]));
    }.bind(this));
    this.addSaveButton('DenseLayer', data);
  }

  DenseLayerPane.prototype = Object.create(window.EditorPane.prototype);
  DenseLayerPane.prototype.constructor = DenseLayerPane;

  window.paneRegistry.Network = NetworkPane;
  window.paneRegistry.DenseLayer = DenseLayerPane;

})();
(function() {

  function LSTMPane(data) {
    window.EditorPane.call(this, 'LSTM');

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

    this._stateSize = inValBiases.length;
    this._inSize = inValWeights.length/this._stateSize - this._stateSize;

    var matrices = [inValWeights, inGateWeights, remGateWeights, outGateWeights];
    var biases = [inValBiases, inGateBiases, remGateBiases, outGateBiases];
    var peeps = [inValPeep, inGatePeep, remGatePeep, outGatePeep];

    this._addVecField('InitState', initState);

    var names = ['In Val.', 'In Gate', 'Rem. Gate', 'Out Gate'];
    for (var i = 0; i < 4; i++) {
      this._addVecField(names[i]+' Bias', biases[i]);
      this._addVecField(names[i]+' Peephole', peeps[i]);
      this._addMatField(names[i]+' Weights', matrices[i]);
    }
    this.addSaveButton('LSTM', data);
    this.addCodeButton(function() {
      var names = ['inVal', 'inGate', 'remGate', 'outGate'];
      var lines = [];
      lines.push(window.octave.declareVector('initState', initState));
      for (var i = 0; i < 4; i++) {
        var n = names[i];
        lines.push(window.octave.declareVector(n+'B', biases[i]));
        lines.push(window.octave.declareVector(n+'P', peeps[i]));
        lines.push(window.octave.declareMatrix(n+'W', this._stateSize, matrices[i]));
      }
      window.downloadCode(lines.join('\n'));
    }.bind(this));
  }

  LSTMPane.prototype = Object.create(window.EditorPane.prototype);
  LSTMPane.prototype.constructor = LSTMPane;

  LSTMPane.prototype._addVecField = function(name, vec) {
    this.addEditField(name, function() {
      var pane = new window.VectorPane(vec);
      this.onPush(pane);
    }.bind(this));
  };

  LSTMPane.prototype._addMatField = function(name, mat) {
    this.addEditField(name, function() {
      var pane = new window.MatrixPane(this._stateSize,
        this._inSize+this._stateSize, mat);
      this.onPush(pane);
    }.bind(this));
  };

  function StackedBlockPane(list) {
    window.ListPane.call(this, list, 'StackedBlock');
    this.addSaveButton('StackedBlock', list);
  }

  StackedBlockPane.prototype = Object.create(window.ListPane.prototype);
  StackedBlockPane.prototype.constructor = StackedBlockPane;

  function NetworkBlock(info) {
    window.EditorPane.call(this, 'NetworkBlock');
    this.addEditField('InitState', function() {
      this.onPush(new window.VectorPane(info.startState));
    }.bind(this));
    this.addEditField('Network', function() {
      this.onPush(window.paneForObject(info.network));
    }.bind(this));
    this.addSaveButton('NetworkBlock', info);
  }

  NetworkBlock.prototype = Object.create(window.EditorPane.prototype);
  NetworkBlock.prototype.constructor = NetworkBlock;

  window.paneRegistry.LSTM = LSTMPane;
  window.paneRegistry.StackedBlock = StackedBlockPane;
  window.paneRegistry.NetworkBlock = NetworkBlock;

})();
(function() {

  function VectorPane(values, title) {
    window.EditorPane.call(this, title || 'Vector');
    this._values = values;
    for (var i = 0, len = values.length; i < len; ++i) {
      var field = $('<div></div>').addClass('labeled-field');
      field.append($('<label></label>').text(i));
      var input = $('<input>').val(values[i]).addClass('vec-component');
      (function(i) {
        input.change(function(e) {
          values[i] = parseFloat(e.target.value);
        });
      })(i);
      field.append(input);
      this.element.append(field);
    }
  }

  VectorPane.prototype = Object.create(window.EditorPane.prototype);
  VectorPane.prototype.constructor = VectorPane;

  function MatrixPane(rows, cols, values, title) {
    window.EditorPane.call(this, title || 'Matrix');

    this.element.addClass('mat-pane');

    var table = $('<table></table>');
    var header = $('<thead></thead>').append($('<th></th>'));
    for (var i = 0; i < cols; ++i) {
      header.append($('<th></th>').text(i));
    }
    table.append(header);

    for (var i = 0; i < rows; ++i) {
      var row = $('<tr></tr>');
      row.append($('<td></td>').text(i));
      for (var col = 0; col < cols; ++col) {
        var cellIdx = i*cols + col;
        var input = $('<input>').val(values[cellIdx]).addClass('mat-component');
        row.append($('<td></td>').append(input));
        (function(idx) {
          input.change(function(e) {
            values[idx] = parseFloat(e.target.value);
          });
        })(cellIdx);
      }
      table.append(row);
    }

    this.element.append(table);
  }

  MatrixPane.prototype = Object.create(window.EditorPane.prototype);
  MatrixPane.prototype.constructor = MatrixPane;

  window.VectorPane = VectorPane;
  window.MatrixPane = MatrixPane;

})();
