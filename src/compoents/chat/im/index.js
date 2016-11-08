import './im.scss';
import Xtemplate from 'xtemplate';
import reqwest from 'reqwest';
import config from 'config';
import messageTpl from './messages.html';
import imTpl from './im.html';
import face from 'lib/face';
import clone from 'lib/clone';
import upload from 'lib/upload';
import evaluate from 'lib/evaluate';
import Cookie from 'js-cookie';

class Im {
  constructor(from, to, userInfo, setting, contactId) {
    this.elm = document.createElement('div');
    this.elm.id = 'im';
    this.from = from;
    this.to = to;
    this.userInfo = userInfo;
    this.messages = [];
    this.setting = setting;
    this.contactId = contactId;
  }

  send(body) {
    if (!body) return ;
    var self = this;
    var host = config.send;
    var data = {body: body, from: this.from, to: this.to, user_info: this.user_info};
    reqwest({url: host, method: 'POST', data: data})
      .then(resp => {
        resp.data.created_at = parseInt(Date.now(), 10)
        if (/^((http|https)\:\/\/)?[a-zA-Z0-9\.\/\?\:@\-_=#]+\.([a-zA-Z0-9\.\/\?\:@\-_=#])*.(jpg|jpeg|gif|png|bmp)/i.test(resp.data.body)) {
          resp.data.type = 'image';
          resp.data.body = `<img src="${resp.data.body}"/>`;
        } else {
          resp.data.type = 'text';
        }
        self.messages.push(resp.data);
        self.renderMessage(self.messages);
      });
  }

  onSend(view) {
    var self = this;
    var submit = view.querySelector('#submit')
    var textarea = view.querySelector('textarea');
    submit.addEventListener('click', function() {
      self.send(textarea.value);
      textarea.value = '';
    });

    textarea.addEventListener('keydown', function(e) {
      if (e.keyCode === 13 && e.ctrlKey) {
        textarea.value = textarea.value + '\n';
      } else if (e.keyCode == 13) {
        e.preventDefault();
        self.send(textarea.value);
        textarea.value = '';
      }
    });
  }

  renderMessage() {
    var messages = clone(this.messages);//_.cloneDeep(this.messages);
    messages.forEach((message, i) => {
      message.created_at = new Date(parseInt(message.created_at, 10)).toString().substring(16, 21);
      message.body = face.textToHtml(message.body);
      if (/^<img/.test(message.body)) {
        message.type = 'image';
        var href = message.body.match(/src=('|")(.+)\1/)[2];
        message.body = `<a href="${href}" target="_blank">${message.body}</a>`;
      }
    });

    var html = new Xtemplate(messageTpl).render({messages: messages, setting: this.setting});
    var message = view.querySelector('.messages');
    message.innerHTML = html;
    message.scrollTop = message.querySelector('.messages-wrap').clientHeight;
    var images = message.querySelectorAll('img');
    [].forEach.call(images, function(image) {
      image.addEventListener('load', function() {
          message.scrollTop = message.querySelector('.messages-wrap').clientHeight;
      });
    });
  }

  resetScroll(direction) {
    var elm = this.dom.querySelector('.messages');
    if (direction === 'up') {
      elm.scrollTop = 0;
    } else {
    }
  }

  init() {
    var self = this;
    if (!document.getElementById('im')) {
      var html = new Xtemplate(imTpl).render({setting: self.setting});
      this.elm.innerHTML = html;
      view.appendChild(this.elm);
      this.onSend(view);
      var groupId = Cookie.get('group_id');
      var host = `${config.start}?contact_id=${this.contactId}&user_info=${this.userInfo}&group_id=${groupId}&web_id=${this.setting.id}`;
      reqwest({url: host})
        .then(resp  => {
          self.messages = resp.data;
          self.renderMessage();
          if (resp.data.length) {
            Cookie.set('order_id', resp.data[0].package.order_id);
          }
        });
    }

    var error = this.elm.querySelector('.error-tips');
    // 加载表情
    var faceDom = view.querySelector('.faces');
    face.render(faceDom);
    this.elm.querySelector('.face').addEventListener('click', function() {
      face.toggle();
    });

    // 上传
    this.elm.querySelector('.upload').addEventListener('click', function() {
      var file = document.getElementById('file');
      file.click();
    });

    upload.init(function(resp) {
      self.send(resp.data);
    });

    // 评价
    this.elm.querySelector('.evaluate').addEventListener('click', function() {
      evaluate.toggle();
    });

    evaluate.init(function(resp) {
      var message = {
        body: resp.data,
        type: 'SYSTEM',
        direction: 'receive',
        created_at: parseInt(Date.now() / 1000)
      }
      self.messages.push(message);
      self.renderMessage(self.messages);
    });
  }

  render(view) {
    var self = this;
    window.addEventListener('message', function(message) {
      var msg = JSON.parse(message.data);
      if (!Cookie.get('chatting')) {
        self.init();
        Cookie.set('chatting', 1);
        var url = `${config.read}?from=${self.from}`;
        reqwest({
          url: url,
          method: 'GET'
        });
      }
      if (msg.action === 'read') {
        var url = `${config.read}?from=${self.from}`;
        reqwest({
          url: url,
          method: 'GET'
        });
      }
    });
    if (Cookie.get('chatting')) {
      this.init();
    }
  }
}

export default Im;
