'use strict';

// Dedicated lightweight PWA Service Worker for Doctor's Diet notifications & alarm actions.
// Intentionally does not cache HTML/JS assets so app deployments always take effect immediately.

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', function (event) {
  var notification = event.notification;
  var action = event.action || '';
  var data = (notification && notification.data) || {};
  notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      var targetClient = clientList.length > 0 ? clientList[0] : null;
      if (targetClient) {
        if (action === 'snooze') {
          targetClient.postMessage({
            type: 'SNOOZE_ALARM',
            title: data.title || 'Meal Reminder',
            alarmType: data.alarmType || 'meal',
            minutes: 5
          });
        } else {
          targetClient.postMessage({ type: 'STOP_ALARM' });
        }
        if (action !== 'dismiss' && 'focus' in targetClient) {
          return targetClient.focus();
        }
        return Promise.resolve();
      }
      if (action !== 'dismiss' && self.clients.openWindow) {
        return self.clients.openWindow('./');
      }
      return Promise.resolve();
    })
  );
});

self.addEventListener('notificationclose', function (event) {
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      clientList.forEach(function (client) {
        client.postMessage({ type: 'STOP_ALARM' });
      });
    })
  );
});

self.addEventListener('message', function (event) {
  var msg = event.data || {};
  if (msg.type === 'SHOW_NOTIFICATION' && self.registration && self.registration.showNotification) {
    event.waitUntil(
      self.registration.showNotification(msg.title || "Doctor's Diet", msg.options || {})
    );
  }
});

