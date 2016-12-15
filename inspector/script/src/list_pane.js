(function() {

  function ListPane(items, title) {
    window.EditorPane.call(this, title);
    for (var i = 0, len = items.length; i < len; ++i) {
      (function(item) {
        var field = $('<div></div>').addClass('labeled-field');
        field.append($('<label></label>').text(item.type));
        var button = $('<button class="edit-button">Edit</button>');
        field.append(button.click(function() {
          this.onPush(window.paneForObject(item));
        }.bind(this)));
        this.element.append(field);
      }.bind(this))(items[i]);
    }
  }

  ListPane.prototype = Object.create(window.EditorPane.prototype);
  ListPane.prototype.constructor = ListPane;

  window.ListPane = ListPane;

})();
