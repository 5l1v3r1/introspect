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
