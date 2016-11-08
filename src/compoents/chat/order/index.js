import HTML from './order.html';
import Xtemplate from 'xtemplate';
import config from 'config';
import Cookie from 'js-cookie';
import Im from '../im';
import reqwest from 'reqwest';
import './order.scss';

class Order {
  constructor(from, to, userInfo, orders, setting) {
    this.elm = document.createElement('div');
    this.elm.id = 'order';
    this.from = from;
    this.to = to;
    this.userInfo = userInfo;
    this.orders = orders;
    this.setting = setting;
  }

  validator(error, elements) {
    error.style.display = 'none';
    for (var i = 0; i < elements.length; i++) {
      var elm = elements[i];
      elm.className = '';
      if (!elm.value) {
        error.innerText = '请将问题填写完整'
        error.style.display = 'block';
        elm.className = 'error'
      }
    }
  }

  render(view) {
    var self = this;
    var html = new Xtemplate(HTML).render({orders: this.orders, setting: this.setting});
    var elm = this.elm;
    this.elm.innerHTML = html;
    view.appendChild(this.elm);

    var error = this.elm.querySelector('.error-tips');
    var select = this.elm.querySelector('select');
    var orders = this.elm.querySelector('.orders');
    var items = this.elm.querySelectorAll('.order');
    var success = this.elm.querySelector('.success');
    var wrap = this.elm.querySelector('.wrap');
    var reset = success.querySelector('#reset');

    select.addEventListener('change', function() {
      orders.style.display = 'block';
      if (this.selectedIndex === 0) {
        orders.style.display = 'none';
      } else {
        for (var i = 0; i < items.length; i++) items[i].style.display = 'none';
        items[this.selectedIndex-1].style.display = 'block';
      }
    });

    this.elm.querySelector('#submit').addEventListener('click', function() {
      var order = null;
      for (var i = 0; i < items.length; i++) {
        if (items[i].style.display === 'block') {
          order = items[i];
        }
      }
      var elements = order.elements;
      self.validator(error, elements);
      if (error.style.display === 'block') return ;

      var body = {};
      for (var i = 0; i < elements.length; i++) {
        var elm = elements[i];
        body[elm.name] = elm.value;
      }

      var params = {
        from: self.from,
        to: self.to,
        title: select.value,
        body: JSON.stringify(body)
      };

      reqwest({
        url: config.send,
        method: 'POST',
        data: params,
      }).then(resp => {
        if (resp.success) {
          wrap.style.display = 'none';
          success.style.display = 'block';
          Cookie.set('chatting', 1);
        } else {
          error.style.display = 'block';
          error.innerText = resp.msg;
        }
      });
    });

    reset.addEventListener('click', function() {
      var im = new Im(self.from, self.to, self.userInfo, self.setting);
      view.removeChild(self.elm);
      im.render(view);
    });
  }
}

export default Order;
