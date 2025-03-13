Package.describe({
  name: 'epfl:entra-oauth',
  version: '0.0.1',
  summary: 'Use Microsoft Entra to login, for Meteor 2.16.',
  git: 'https://github.com/epfl-si/meteor-entra-auth',
});

Package.onUse(function(api) {
  api.versionsFrom('2.16');

  api.use('ecmascript');
  api.use('oauth2');
  api.use('fetch', 'server');
  api.use('random', 'client');
  api.use('service-configuration');

  api.addFiles('entra_server.js', 'server');
  api.addFiles('entra_client.js', 'client');

  api.mainModule('namespace.js');

  api.export('Entra');
});
