Package.describe({
  name: 'epfl-si:entra-oauth',
  version: '0.0.1',
  summary: 'Use Microsoft Entra to login, frozen to the Meteor 2.16 dependencies. Inspired by telnowedge:microsoft-entra-oauth',
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: null
});

Package.onUse(function(api) {
  api.versionsFrom('2.16');

  api.use('ecmascript');
  api.use('oauth');
  api.use('oauth2');
  api.use('fetch', ['server']);
  api.use('service-configuration');
  api.use('random', 'client');

  api.addFiles('entra_server.js', 'server');
  api.addFiles('entra_client.js', 'client');

  api.mainModule('namespace.js');

  api.export('Entra');
});
