import tpl from './popup.html';
import inviteTpl from './invite.html';
import genKey from 'lib/genKey';
import Cookie from 'js-cookie';
import Xtemplate from 'xtemplate';

class Popup {
  constructor(chat) {
    this.chat = chat;
    this.elm = document.createElement('div');
    this.elm.id = '__USINGNET_HANDLE';
    this.cookieKey = '__USINGNET_CHAT_STATUS';
  }

  startChat() {
    var unread = document.getElementById('__USINGNET_HANDLE_UNREAD');
    if (unread.innerText.trim()) {
        var action = {action: 'read'};
    }  else {
        var action = {action: 'chatting'};
    }
    this.chat.querySelector('iframe').contentWindow.postMessage(JSON.stringify(action), '*');
    this.elm.style.display = 'none';
    this.chat.style.display = 'block';
    unread.innerText = 0;
    unread.style.display = 'none';

    Cookie.set(this.cookieKey, 'open');
  }

  init(view, setting) {
    var elm = this.elm;
    var self = this;
    var html = new Xtemplate(tpl).render({setting: setting});
    elm.innerHTML = html;
    view.appendChild(elm);
    var unread = elm.querySelector('#__USINGNET_HANDLE_UNREAD');

    // HANDLE 位置
    switch (setting.web.direction) {
      case 'bottom-right':
        elm.style.right = (30 + parseInt(setting.web.page_distance)) + 'px';
        elm.style.bottom = (30+ parseInt(setting.web.page_bottom_distance)) + 'px';
        break;
      case 'bottom-left':
        elm.style.left = (30 + parseInt(setting.web.page_distance)) + 'px';
        elm.style.bottom = (30 + parseInt(setting.web.page_bottom_distance)) + 'px';
        break;
      case 'middle-right':
        elm.style.right = (30 + parseInt(setting.web.page_distance)) + 'px';
        var height = elm.querySelector('.__USINGNET_HANDLE_ICON').clientHeight;
        elm.style.bottom = (window.innerHeight - height)/2 + 'px';
      break;
      case 'middle-left':
        elm.style.left = (30 + parseInt(setting.web.page_distance)) + 'px';
        var height = elm.querySelector('.__USINGNET_HANDLE_ICON').clientHeight;
        elm.style.bottom = (window.innerHeight - height)/2 + 'px';
      break;
    }

    elm.addEventListener('click', function() {
      self.startChat();
      var inviteElm = document.getElementById('__USINGNET_INVITE');
      if (inviteElm) {
        inviteElm.style.display = 'none';
      }
      Cookie.set('__USINGNET_INVITE_CLOSED', 1);
    });

    // 主动邀请
    if (setting.online && setting.web.invite && !Cookie.get('__USINGNET_INVITE_CLOSED')) {
      var inviteElm = document.createElement('div');
      inviteElm.id = '__USINGNET_INVITE';
      var html = new Xtemplate(inviteTpl).render({setting: setting});
      inviteElm.innerHTML = html;
      view.appendChild(inviteElm);

      var inviteImg = inviteElm.querySelector('#__USINGNET_INVITE_IMG');
      inviteImg.addEventListener('load', function() {
        var inviteClose = inviteElm.querySelector('#__USINGNET_INVITE_CLOSE');
        var inviteTxt = inviteElm.querySelector('#__USINGNET_INVITE_TXT');
        inviteElm.style.cssText = `position: absolute; top: 0; left: 0; bottom: 0;
          right: 0; width:${inviteImg.width}px; height: ${inviteImg.height}px; margin: auto; display: none; cursor: pointer`;
        var second = setting.web.invite_wait_time || 0;
        setTimeout(function() {
          inviteElm.style.display = 'block';
        }, second);
        inviteElm.addEventListener('click', function() {
          self.startChat(unread);
          Cookie.set('__USINGNET_INVITE_CLOSED', 1);
          inviteElm.style.display = 'none';
        });
        inviteClose.addEventListener('click', function() {
          Cookie.set('__USINGNET_INVITE_CLOSED', 1);
          inviteElm.style.display = 'none';
        });
      });
    }

    var chatStatus = Cookie.get('__USINGNET_CHAT_STATUS');
    if (chatStatus === 'open') {
      self.elm.style.display = 'none';
      self.chat.style.display = 'block';
      Cookie.set(self.cookieKey, 'open');
    }
  }

  render(view) {
    var self = this;
    window.addEventListener('message', function(message) {
      var message = JSON.parse(message.data);
      switch (message.action) {
        case 'init':
          self.init(view, message.data);
        break;
        case 'minimize':
          self.chat.style.display = 'none';
          self.elm.style.display = 'block';
          Cookie.set(self.cookieKey, 'closed');
        break;
        case 'unread':
          var unread = document.getElementById('__USINGNET_HANDLE_UNREAD');
          if (self.elm.style.display !== 'none') {
            var num = 0;
            if (unread.innerText.trim()) {
              num = parseInt(unread.innerText, 10);
            }
            num += message.num;
            if (num > 99) {
              num = '···';
            }
            unread.innerText = num;
            unread.style.display = 'block';
          }
        break;
      }
    });
  }
}

export default Popup;
