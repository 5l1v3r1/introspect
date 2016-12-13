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
