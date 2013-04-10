/* Option handling. */

function save() {
  /* The forms themselves should have done all input validation, but let's do
   * sanity check here as well. */
  var f = document.forms['options'];
  var errors = [];

  if (f.site_url.value.length > 0)
    localStorage['site_url'] = f.site_url.value;
  else
    errors.push('Site URL cannot be blank.');

  if (f.login.value.length > 0 || f.single_user.checked)
    localStorage['login'] = f.login.value;
  else
    errors.push('Login required unless single-user mode is enabled.');

  if (parseInt(f.update_interval.value) > 0)
    localStorage['update_interval'] = f.update_interval.value;
  else
    errors.push('Update interval must be greater than zero.');

  localStorage['show_badge'] = (f.show_badge.checked) ? '1' : '0';
  localStorage['show_fresh'] = (f.show_fresh.checked) ? '1' : '0';
  localStorage['single_user'] = (f.single_user.checked) ? '1' : '0';
  localStorage['update_feeds'] = (f.update_feeds.checked) ? '1' : '0';

  var d = new Date();
  localStorage['prefs_updated'] = d.getTime();

  if (errors.length != 0) {
    /* localStorage likes strings. Serialize with '+' as record separator. */
    localStorage['errors'] = errors.join('+');
  }
  else
    localStorage['success'] = 'Settings updated successfully at ' +
        d.toTimeString() + '.';

  return false;
}

function single_user_toggle() {
  var f = document.forms['options'];

  f.login.disabled = f.single_user.checked;
}

function init() {
  var f = document.forms['options'];
  var s = document.getElementById('status');

  if (localStorage['errors']) {
    var ul = document.createElement('ul');
    var errors = localStorage['errors'].split('+');
    localStorage.removeItem('errors');

    for (var i = 0; i < errors.length; i++) {
      var li = document.createElement('li');
      li.appendChild(document.createTextNode(errors[i]));
      ul.appendChild(li);
    }

    s.setAttribute('class', 'error');
    s.appendChild(document.createTextNode('Errors were encountered:'));
    s.appendChild(ul);
    s.style.display = 'block';
  }
  else if (localStorage['success']) {
    s.setAttribute('class', 'success');
    s.appendChild(document.createTextNode(localStorage['success']));
    localStorage.removeItem('success');
    s.style.display = 'block';
  }

  if (localStorage['site_url'])
    f.site_url.value = localStorage['site_url'];

  if (localStorage['login'])
    f.login.value = localStorage['login'];

  if (localStorage['update_interval'])
    f.update_interval.value = localStorage['update_interval'];
  else
    f.update_interval.value = '15';

  if (localStorage['show_badge'])
    f.show_badge.checked = localStorage['show_badge'] == '1';
  else
    f.show_badge.checked = true;

  if (localStorage['show_fresh'])
    f.show_fresh.checked = localStorage['show_fresh'] == '1';
  else
    f.show_fresh.checked = false;

  if (localStorage['single_user'])
    f.single_user.checked = localStorage['single_user'] == '1';
  else
    f.single_user.checked = false;

  if (localStorage['update_feeds'])
    f.update_feeds.checked = localStorage['update_feeds'] == '1';
  else
    f.update_feeds.checked = false;

  single_user_toggle();

  var last_updated = $('last_updated');

  var d = new Date();

  d.setTime(localStorage['last_updated']);

  last_updated.innerHTML = d;

  var feeds_last_updated = $('feeds-last-updated');

  d.setTime(localStorage['last_feeds_updated']);

  feeds_last_updated.innerHTML = d;
}

document.addEventListener('DOMContentLoaded', function() {
  /* Need to listen to `click` instead of submit to enable HTML5 checking of
   * values. */
  document.getElementById('options').addEventListener('click', save);
  document.querySelectorAll('input[name$="single_user"]')[0].addEventListener(
    'change', single_user_toggle);
  init();
});

