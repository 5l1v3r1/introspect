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
