(function() {

  function serializeAndDownload(obj) {
    var data = window.serializeObject(obj);
    if (!data) {
      alert('could not serialize');
      return;
    }
    var str = String.fromCharCode.apply(String, data);
    window.location = 'data:application/octet-stream;base64,' + btoa(str);
  }

  function downloadCode(code) {
    window.location = 'data:application/octet-stream;base64,' + btoa(code);
  }

  window.serializeAndDownload = serializeAndDownload;
  window.downloadCode = downloadCode;

})();
