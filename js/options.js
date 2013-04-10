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

  /* TODO: Remove this if-clause future update after it has had time to
   * propagate to users.
   *
   * This migrates from earlier (version 0.5.2) localStorage index naming.  In
   * many ways it's overkill since the only problem after an initial item
   * count/feed update after extension upgrade that would occur is that a
   * localStorage index would linger and waste ~20 B or something, but let's
   * try to do it nicely :-) . */
  if (localStorage['last_feeds_updated']) {
    localStorage['feeds_last_updated'] = localStorage['last_feeds_updated'];
    localStorage.removeItem('last_feeds_updated');
  }

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

  var d = new Date();
  var last_updated = document.getElementById('last-updated');
  var feeds_last_updated = document.getElementById('feeds-last-updated');

  if (localStorage['last_updated']) {
    d.setTime(localStorage['last_updated']);
    last_updated.appendChild(document.createTextNode(d.toString()));
  }
  else
    last_updated.appendChild(document.createTextNode('not yet polled.'));

  if (localStorage['feeds_last_updated']) {
    d.setTime(localStorage['feeds_last_updated']);
    feeds_last_updated.appendChild(document.createTextNode(d.toString()));
  }
  else
    feeds_last_updated.appendChild(document.createTextNode(
        'not yet updated.'));
}

document.addEventListener('DOMContentLoaded', function() {
  /* Need to listen to `click` instead of submit to enable HTML5 checking of
   * values. */
  document.getElementById('options').addEventListener('click', save);
  document.querySelectorAll('input[name$="single_user"]')[0].addEventListener(
    'change', single_user_toggle);
  init();
});

