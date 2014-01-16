var settings = {
  host: "http://www.wddx.ru",
  api_call: "ws://wddx.ru/ws/api/v1/games"
};

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({'url': settings.host}, function(tab) {
    // tab opened
  });
});

var messages = []

var helpers = {
  deleteMessage: function(msg) {
    messages = _.reject(messages, {data: {id: msg.data.id}})
  },

  clearMessages: function() {
    messages = []
  },

  setBadgeText: function() {
    //NOTE Можно не пересчитывать каждый раз полностью.
    var msg_count = messages.length;
    var text = "";
    if (msg_count > 0){
      text += msg_count;
    }
    chrome.browserAction.setBadgeText({text: text});
  }
}

var handlers = {

  openGame: function(msg) {
    messages = messages.concat(msg);
  },

  startGame: function(msg) {
    //NOTE: Временно показываем игру в значке, даже если она начата
    //helpers.deleteMessage(msg);
  },

  finishGame: function(msg) {
    helpers.deleteMessage(msg);
  }

}

$(function(){
  (function establish_connection(){
    var bullet = $.bullet(settings.api_call);
    bullet.onopen = function(){
      console.log('bullet: opened');
    };

    bullet.ondisconnect = function(){
      console.log('bullet: disconnected');
      helpers.clearMessages();
      helpers.setBadgeText();
    };

    bullet.onclose = function(){
      console.log('bullet: closed');
      helpers.clearMessages();
      helpers.setBadgeText();
    };

    bullet.onmessage = function(e){
      msg = $.parseJSON(e.data);
      handlers[msg.handler](msg);
      helpers.setBadgeText();
    };

    bullet.onheartbeat = function(){
      bullet.send('ping');
    }
  })();
});