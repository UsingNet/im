import Lm from './lm';
import Im from './im';
import Group from './group';
import Order from './order';
import Header from './header';
import reqwest from 'reqwest';
import config from '../../config';
import tpl from 'xtemplate';
import io from 'socket.io-client';
import Cookie from 'js-cookie';
import './chat.scss';

class Chat {
  constructor(from, to, userInfo, href, title) {
    this.from = from;
    this.to = to;
    this.userInfo = userInfo;
    this.href = href;
    this.title = title;
  }

  render(view) {
    var self = this;
    var host = `${config.token}?from=${self.from}&to=${self.to}&href=${this.href}&title=${this.title}`;
    var messages = [];
    // 获取团队配置
    reqwest({url: host})
      .then(resp => {
        if (resp.success) {
          window.parent.postMessage(JSON.stringify({action: 'init', data: resp}), '*');
          var header = new Header(resp.web);
          header.render(view);

          var chat = new Im(self.from, self.to, self.userInfo, resp.web, resp.contact_id);
          if (resp.web.display_agent_group && resp.online && !Cookie.get('group_id')) {
            var chat = new Group(resp.group);
          }

          var host = `${config.socket}?token=${resp.token}`;
          var socket = io(host);
          socket.on('message', function(message) {
            if (message.length === 0) return ;
            if (chat.messages) {
              var unread = 0;
              // 未读消息
              if (message.length) {
                unread = message.length;
              } else {
                Cookie.set('order_id', message.package.order_id);
                chat.messages.push(message);
                unread++;
              }
              window.parent.postMessage(JSON.stringify({action: 'unread', num: unread}), '*');
              chat.renderMessage();
            }
          });

          if (resp.web.type === 'IM-LM') {
            if (!resp.online) {
              chat = new Lm(self.from, self.to, self.userInfo, resp.web);
            }
          } else if (resp.web.type === 'ORDER') {
            var chatting = Cookie.get('chatting');
            if (!resp.online) {
              chat = new Lm(self.from, self.to, self.userInfo, resp.web);
            } else if (!chatting) {
              chat = new Order(self.from, self.to, self.userInfo, resp.web.order, resp.web);
            }
          }
          chat.render(view);
        } else {
          view.innerHTML = `<div class="error-tips" style="display:block">${resp.msg}</div>`;
        }
      });
  }
}

export default Chat;
