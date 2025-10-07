Package.describe({
  name: 'epfl:entra-oauth',
  version: '0.0.6',
  summary: 'Use Microsoft Entra to login',
  git: 'https://github.com/epfl-si/meteor-entra-auth',
});

Package.onUse(function(api) {
  api.versionsFrom(['3.3']);

  api.use('oauth');
  api.use('oauth2');
  api.use('ecmascript');
  api.use('fetch', 'server');
  api.use('random', 'client');
  api.use('service-configuration');

  api.addFiles('entra_server.js', 'server');
  api.addFiles('entra_client.js', 'client');
  api.addFiles('config.js', 'server');

  api.mainModule('namespace.js');

  api.export('Entra');
});
