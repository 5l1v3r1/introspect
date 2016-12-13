(function() {

  function App() {
    this._upload = new window.UploadScene();
  }

  window.addEventListener('load', function() {
    new App();
  });

})();
