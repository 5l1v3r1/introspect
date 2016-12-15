(function() {

  function NetworkPane(data) {
    window.ListPane.call(this, data, 'Network');
    this.addSaveButton('Network', data);
  }

  NetworkPane.prototype = Object.create(window.ListPane.prototype);
  NetworkPane.prototype.constructor = NetworkPane;

  window.paneRegistry.Network = NetworkPane;

})();
