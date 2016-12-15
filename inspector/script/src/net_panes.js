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
