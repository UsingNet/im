import tpl from './lm.html';
import config from 'config';
import reqwest from  'reqwest';
import Xtemplate from 'xtemplate';
import Cookie from 'js-cookie';
import './lm.scss';

class Lm {
  constructor(from, to, userInfo, setting) {
    this.elm = document.createElement('div');
    this.elm.id = 'lm';
    this.from = from;
    this.to = to;
    this.userInfo = userInfo;
    this.setting = setting;
  }

  validator(error, email, phone, content) {
    // 清除错误提示
    error.style.display = 'none';
    var errors = document.querySelectorAll('.error');
    [].forEach.call(errors, function(error) {
      error.className = '';
    });

    if (!email.value && !phone.value) {
      email.focus();
      error.innerText = '请至少填写一种联系方式';
      error.style.display = 'block';
      return ;
    }

    if (email.value && !/^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(email.value)) {
      error.innerText = '邮箱格式不正确';
      error.style.display = 'block';
      email.focus();
      email.className = 'error';
      return ;
    }

    if (phone.value && !/^(13\d|15[^4\D]|17[13678]|18\d)\d{8}|170[^346\D]\d{7}$/.test(phone.value)) {
      error.innerText = '手机号码格式不正确';
      error.style.display = 'block';
      phone.focus();
      phone.className = 'error';
      return ;
    }

    if (!content.value) {
      error.innerText = '请填写内容';
      error.style.display = 'block';
      content.focus();
      content.className = 'error';
      return ;
    }
  }

  render(view) {
    var self = this;
    var html = new Xtemplate(tpl).render({setting: this.setting});
    this.elm.innerHTML = html;
    view.appendChild(this.elm);
    Cookie.set('chatting', 1);

    self.elm.querySelector('#submit').addEventListener('click', function() {
      var email = document.getElementById('email');
      var phone = document.getElementById('phone');
      var content = document.getElementById('content');
      var error = document.querySelector('.error-tips');
      self.validator(error, email, phone, content);
      if (error.style.display === 'block') {
        return ;
      }

      var form = self.elm.querySelector('.form');
      var success = self.elm.querySelector('.success');
      var params = {
          'email': email.value,
          'phone': phone.value,
          'body': content.value,
          'from': self.from,
          'to': self.to,
          'user_info': self.userInfo
      };

      reqwest({
        url: config.lm,
        method: 'POST',
        data: params
      }).then(resp => {
        if (resp.success) {
          content.value = '';
          form.style.display = 'none';
          success.style.display = 'block';
        } else {
          error.innerText = resp.msg;
          error.style.display = 'block';
        }
      });

      self.elm.querySelector('#reset').addEventListener('click', function() {
          form.style.display = 'block';
          success.style.display = 'none';
      });
    });
  }
}

export default Lm;
