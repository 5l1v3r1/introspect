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
