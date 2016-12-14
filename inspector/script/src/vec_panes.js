(function() {

  function VectorPane(values) {
    window.EditorPane.call(this);
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
