/* Handle showing of new item count and polling the TT-RSS server. */

var last_updated = 0;
var feeds_last_updated = 0;
var prefs_last_updated = 0;

function param_escape(arg) {
  if (typeof encodeURIComponent != 'undefined')
    return encodeURIComponent(arg);
  else
    return escape(arg);
}

function update_feeds() {
  console.log('feeds update');

  var requestUrl = localStorage['site_url'] +
    '/public.php?op=globalUpdateFeeds';

  var xhr = new XMLHttpRequest();

  xhr.open('POST', requestUrl, true);
  xhr.send();

  var d = new Date();
  localStorage['feeds_last_updated'] = d.getTime();
}

function update() {
  console.log('update');

  var d = new Date();
  var login = localStorage['login'];
  var single_user = localStorage['single_user'];

  if (single_user == '1') login = 'admin';

  var requestUrl = localStorage['site_url'] + '/public.php';
  var params = 'op=getUnread&fresh=1&login=' + param_escape(login);

  var xhr = new XMLHttpRequest();

  xhr.open('POST', requestUrl, true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.send(params);

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var icon = new Object();
      var title = new Object();
      var badge = new Object();
      var badge_color = new Object();

      // init stuff
      icon.path = 'images/normal.png';
      title.title = '';
      badge.text = '';
      badge_color.color = [0, 0, 0, 0];

      var show_badge = localStorage['show_badge'] == '1';
      var show_fresh = localStorage['show_fresh'] == '1';

      if (xhr.status == 200) {
        var response = xhr.responseText.split(';');

        var unread = parseInt(response[0]);

        if (isNaN(unread)) unread = 0;

        var fresh;

        if (response.length == 2)
          fresh = parseInt(response[1]);
        else
          fresh = 0;

        if (isNaN(fresh)) fresh = 0;

        if (unread > 0) {
          icon.path = 'images/alert.png';
          title.title = 'You have %s unread articles.'.replace('%s', unread);

          if (show_fresh && fresh > 0) {
            badge.text = fresh + '';
            badge_color.color = [0, 200, 0, 255];
          } else {
            badge.text = unread + '';
            badge_color.color = [255, 0, 0, 255];
          }
        } else if (unread == -1) {
          icon.path = 'images/error.png';

          var errorMsg = xhr.responseText.split(';')[1];

          title.title = 'Error: %s.'.replace('%s', errorMsg.trim());
        } else {
          title.title = 'You have no unread articles.';
        }

        localStorage['last_updated'] = d.getTime();
        localStorage['last_error'] = '';
      } else {
        localStorage['last_error'] = xhr.responseText;

        icon.path = 'images/error.png';
        title.title = 'Error (%s) while updating.'.replace('%s', xhr.status);
      }

      if (!show_badge) badge.text = '';

      chrome.browserAction.setBadgeBackgroundColor(badge_color);
      chrome.browserAction.setBadgeText(badge);
      chrome.browserAction.setTitle(title);
      chrome.browserAction.setIcon(icon);
    }
  };
}

function timeout() {
  var update_interval;
  var prefs_updated;
  var feeds_update_interval = 30 * 60 * 1000;

  if (localStorage['update_interval'])
    update_interval = localStorage['update_interval'] * 60 * 1000;
  else
    update_interval = 15 * 60 * 1000;

  if (localStorage['prefs_updated'])
    prefs_updated = localStorage['prefs_updated'];
  else
    prefs_updated = -1;

  var d = new Date();

  if (d.getTime() > last_updated + update_interval ||
      prefs_updated != prefs_last_updated) {
    last_updated = d.getTime();
    try {
      update();
    } catch (e) {
      console.warn(e);
    }
  }

  if (localStorage['update_feeds'] == 1 &&
      (d.getTime() > feeds_last_updated + feeds_update_interval ||
       prefs_updated != prefs_last_updated)) {
    feeds_last_updated = d.getTime();

    try {
      update_feeds();
    } catch (e) {
      console.warn(e);
    }
  }

  prefs_last_updated = prefs_updated;
}

function init() {
  chrome.browserAction.onClicked.addListener(function() {
    var site_url = localStorage['site_url'];

    if (site_url) {
      chrome.tabs.create({url: site_url});
    }
  });

  // TODO: Create smarter algorithm that sets `periodInMinutes` to
  // `feeds_update_interval` and updates the `alarm` object when extension
  // preferences are saved.
  timeout();
  chrome.alarms.create({periodInMinutes: 1});
  chrome.alarms.onAlarm.addListener(function() {timeout();});
}

init();

