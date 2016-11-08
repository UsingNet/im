import reqwest from 'reqwest';
import Cookie from 'js-cookie';
import config from '../config';

class Evaluate {
    toggle() {
      var evaluate = document.getElementById('evaluate');
      evaluate.style.display = evaluate.style.display === 'block' ? 'none' : 'block';
    }

    init(cb) {
      var self = this;
      var evaluate = document.getElementById('evaluate');
      evaluate.querySelector('.close').addEventListener('click', function() {
        self.toggle();
      });

      var lis = evaluate.querySelectorAll('li');
      [].forEach.call(lis, function(li) {
        li.addEventListener('click', function() {
          for (var i = 0; i < lis.length; i++) lis[i].className = lis[i].className.replace(/ |selected/g, '');
          li.className = li.className + ' selected';
        });
      });

      evaluate.querySelector('.btn').addEventListener('click', function() {
        var con = evaluate.querySelector('textarea');
        var level = evaluate.querySelector('.selected').className.replace(/ |selected/g, '');
        var content = con.value;
        var orderId = Cookie.get('order_id');
        reqwest({
          url: config.evaluate,
          method: 'POST',
          data: {level: level, content: content, order_id: orderId}
        }).then(resp => {
          self.toggle();
          cb(resp);
          con.value = '';
        });
      });
    }
}

export default new Evaluate;
