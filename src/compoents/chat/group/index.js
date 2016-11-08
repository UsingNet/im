import Cookie from 'js-cookie';
import tpl from './group.html';
import Xtemplate from 'xtemplate';
import './group.scss';

class Group {
  constructor(groups) {
    this.groups = groups;
    this.elm = document.createElement('div');
    this.elm.id = 'group';
  }

  render(view) {
    var HTML = new Xtemplate(tpl).render({groups: this.groups});
    this.elm.innerHTML = HTML;
    view.appendChild(this.elm)

    var group = this.elm.querySelectorAll('.group');
    [].forEach.call(group, function(group) {
      group.addEventListener('click', function(e) {
        var id = e.target.dataset.id;
        Cookie.set('group_id', id);
        Cookie.set('chatting', 1);
        location.reload();
      });
    });
  }
}

export default Group
