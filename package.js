Package.describe({
  name: 'epfl:entra-oauth',
  version: '0.0.5',
  summary: 'Use Microsoft Entra to login, for Meteor 2.16.',
  git: 'https://github.com/epfl-si/meteor-entra-auth',
});

Package.onUse(function(api) {
  // despite saying it works with 3.0,
  // it has not been tested. The value is added only to escape
  // the dependencies versions hell between oauth and oauth2 package
  api.versionsFrom(['2.16', '3.0']);

  api.use('oauth');
  api.use('oauth2');
  api.use('ecmascript');
  api.use('fetch', 'server');
  api.use('random', 'client');
  api.use('service-configuration');

  api.addFiles('entra_server.js', 'server');
  api.addFiles('entra_client.js', 'client');

  api.mainModule('namespace.js');

  api.export('Entra');
});
