import Popup from './compoents/popup';
import Chat from './compoents/chat';
import './scss/main.scss';
import genKey from './lib/genKey';
import url from './lib/url'
import Cookie from 'js-cookie';
import config from './config';

window.usingnetCrm = {};
var host = config.host.replace('//', '');

if (location.host !== host) {
  var key = '__USINGNET_TRACK_ID';
  var trackId = Cookie.get(key);
  if (!trackId) {
    trackId = genKey();
    Cookie.set(key, trackId);
  }

  if (typeof window.usingnetJsonP === 'function') {
    usingnetJsonP(usingnetInit);
  }

  function usingnetInit(to, userInfo) {
    var url = `${config.host}?from=${trackId}&to=${to}&uesr_info=${userInfo}&href=${encodeURIComponent(location.href)}&title=${encodeURIComponent(document.title)}`;
    var elm = document.createElement('div');
    elm.id = '__USINGNET_CHAT';
    //elm.style.display = 'none';
    var iframe = document.createElement('iframe')
    iframe.id = '__USINGNET_CHAT_IFRAME';
    iframe.src = url;
    iframe.style.border = 0;
    elm.appendChild(iframe);
    document.body.appendChild(elm);
    var popup = new Popup(elm);
    popup.render(document.body);

    window.usingnetCrm.hide = function() {
      document.getElementById('__USINGNET_HANDLE').style.display = 'none';
    }
    window.usingnetCrm.show = function() {
      document.getElementById('__USINGNET_HANDLE').style.display = 'block';
    }
    window.usingnetCrm.getUrl = function() {
      return url;
    }
  }

} else {
  var chat = new Chat(url('from'), url('to'), url('user_info'), url('href'), url('title'));
  chat.render(document.getElementById('view'));
}
