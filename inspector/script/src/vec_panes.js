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
