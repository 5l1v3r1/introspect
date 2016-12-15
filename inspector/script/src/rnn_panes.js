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

    this.element.append(this._vecField('InitState', initState));

    var names = ['In Val.', 'In Gate', 'Rem. Gate', 'Out Gate'];
    for (var i = 0; i < 4; i++) {
      this._addVecField(names[i]+' Bias', biases[i]);
      this._addVecField(names[i]+' Peephole', peeps[i]);
      this._addMatField(names[i]+' Weights', matrices[i]);
    }
    this.addSaveButton('LSTM', data);
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
