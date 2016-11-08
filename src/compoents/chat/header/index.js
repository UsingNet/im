import HTML from './header.html';
import Xtemplate from 'xtemplate';
import './header.scss';

class Header {
  constructor(setting) {
    this.elm = document.createElement('div');
    this.elm.id = 'header';
    this.setting = setting;
    this.elm.style.backgroundColor = '#' + setting.title_bg_color;
    this.elm.style.color = '#' + setting.title_txt_color;
  }

  render(view) {
    var html = new Xtemplate(HTML).render({setting: this.setting});
    this.elm.innerHTML = html;
    view.appendChild(this.elm);
    this.elm.querySelector('#minimize').addEventListener('click', function() {
      window.parent.postMessage(JSON.stringify({action: 'minimize'}), '*');
    });
  }
}

export default Header;
