/**
 * Throttle A tool for limiting repeated calls to anything on the server
 * (the choice was made not to allow this on the client, so it's actually secure)
 *
 * ThrottleAccounts.login('global', 20, 1000, 'Under Heavy Load - too many login attempts');
 * ThrottleAccounts.login('ip', 3, 1000, 'Only 3 Login Attempts from the same IP every second');
 * ThrottleAccounts.login('connection', 8, 10000, 'Only 8 Login Attempts from the same DDP connection every 10 seconds');
 *
 * ThrottleAccounts.create('global', 20, 1000, 'Under Heavy Load - too many accounts created');
 *
 */
if (Meteor.isServer) {

  if (typeof Throttle == 'undefined') {
    throw new Meteor.Error(500, 'Throttle Missing from server for zeroasterisk:throttle-accounts');
  }

  ThrottleAccounts = {
    // placeholder for callbacks from Accounts
    callbacks: {}
  };

  // clear a previously setup validation rule callback
  ThrottleAccounts.clearCallback = function(cbkey) {
    if (_.has(ThrottleAccounts.callbacks, cbkey)) {
      return true;
    }
    if (typeof ThrottleAccounts.callbacks[cbkey] != "object") {
      return true;
    }
    ThrottleAccounts.callbacks[cbkey].stop();
    delete ThrottleAccounts.callbacks[cbkey];
  };


  // limit login for this scope
  //   scope: [connection, ip, user, global]
  ThrottleAccounts.login = function(scope, allowedCount, expireInMS, message) {
    check(scope, String);
    check(allowedCount, Match.Integer);
    check(expireInMS, Match.Integer);
    if (!(message)) {
      message = 'You may only login ' + allowedCount + ' times in a row, wait a while and try again';
    }
    var cbkey = 'login' + scope;

    console.log(
      'ThrottleAccounts.login() validation setup: ' +
      'allow ' + allowedCount + ' login attempt every ' + expireInMS + ' MS ' +
      '(scope: ' + scope + ')'
    );

    // cleanup before setup
    ThrottleAccounts.clearCallback(cbkey);

    // create the callback / validation
    ThrottleAccounts.callbacks[cbkey] = Accounts.validateLoginAttempt(function(info) {
      if (scope == 'user' && !_.has(info, 'user')) {
        // bypass this validate call -- un-successful, we don't know the USER to attach to
        return true;
      }
      var key = ThrottleAccounts._makeKey('validateLoginAttempt', scope, info);
      if (!Throttle.checkThenSet(key, allowedCount, expireInMS)) {
        throw new Meteor.Error(500, message);
      }
      return true;
    });
  };


  // limit create
  //   scope: [connection, ip, user, global]
  ThrottleAccounts.create = function(scope, allowedCount, expireInMS, message) {
    check(scope, String);
    check(allowedCount, Match.Integer);
    check(expireInMS, Match.Integer);
    if (!(message)) {
      message = 'You may only sign-up ' + allowedCount + ' times in a row, wait a while and try again';
    }
    var cbkey = 'login' + scope;

    if (scope == 'connection' || scope == 'ip') {
      // Sadly, we can't seem to get connection data for validateNewUser() :(
      // https://github.com/meteor/meteor/blob/devel/packages/accounts-base/accounts_server.js#L1010
      throw new Meteor.Error(500, 'ThrottleAccounts.create(' + scope +', ....) -- We can not support connection or ip scope for createi()');
    }

    console.log(
      'ThrottleAccounts.create() validation setup: ' +
      'allow ' + allowedCount + ' new user creation attempt every ' + expireInMS + ' MS ' +
      '(scope: ' + scope + ')'
    );


    // cleanup before setup
    ThrottleAccounts.clearCallback(cbkey);

    // create the callback / validation
    ThrottleAccounts.callbacks[cbkey] = Accounts.validateNewUser(function(user) {
      var info = {user: user};
      var key = ThrottleAccounts._makeKey('validateNewUser', scope, info);
      if (!Throttle.checkThenSet(key, allowedCount, expireInMS)) {
        throw new Meteor.Error(500, message);
      }
      return true;
    });
  };


  // make a key for throttle, based on the scope and info
  //   - info: http://docs.meteor.com/#/full/accounts_validateloginattempt
  //     - connection: http://docs.meteor.com/#/full/meteor_onconnection
  ThrottleAccounts._makeKey = function(key, scope, info) {
    //console.log(JSON.stringify(info));

    // we are going to also append the "methodName"+"type"+"scope"
    key = key + '-' +
      info.methodName +
      info.type +
      (info.allowed ? 'success' : 'failed') +
      '-' + scope + '-';

    // scope specific extensions of the key
    if (scope == 'connection') {
      key = key + info.connection.id;
    } else if (scope == 'ip') {
      key = key + info.connection.clientAddress;
    } else if (scope == 'user') {
      key = key + info.user._id;
    }

    //console.log(key);

    return key;
  };



}
