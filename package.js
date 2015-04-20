
Package.describe({
  name: "zeroasterisk:throttle-accounts",
  summary: "A secure means of limiting account login/create attempts",
  version: "0.0.3",
  git: "https://github.com/zeroasterisk/Meteor-Throttle-Accounts.git"
});

Package.onUse(function (api) {
  api.versionsFrom("0.9.0");
  api.use(['meteor', 'underscore'], 'server');
  api.use('zeroasterisk:throttle@0.2.0', 'server');
  api.imply('zeroasterisk:throttle');
  // Export the object 'Throttle' to packages or apps that use this package.
  api.export('ThrottleAccounts', 'server');
  api.addFiles('throttle-accounts.js', ['server']);
});

Package.onTest(function (api) {
  api.use("zeroasterisk:throttle");
  api.use("zeroasterisk:throttle-accounts");
  api.use('tinytest@1.0.0');
  api.addFiles('throttle-accounts_tests.js', ['client', 'server']);
});
