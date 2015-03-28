# An Extension of zeroasterisk:throttle for Meteor Accounts

The core package for throttling is here:

* https://atmospherejs.com/zeroasterisk/throttle
* https://github.com/zeroasterisk/Meteor-Throttle


This Extension of that package will throttle login attempts and account
creation attempts for your site:

## Install

`$ meteor add zeroasterisk:throttle`
`$ meteor add zeroasterisk:throttle-accounts`

## Configuration

```
if (Meteor.isServer) {
  // Accounts.validateLoginAttempt()
  ThrottleAccounts.login('global', 20, 1000, 'Under Heavy Load - too many login attempts');
  ThrottleAccounts.login('ip', 3, 1000, 'Only 3 Login Attempts from the same IP every second');
  ThrottleAccounts.login('connection', 8, 10000, 'Only 8 Login Attempts from the same DDP connection every 10 seconds');

  // Accounts.validateNewUser()
  ThrottleAccounts.create('global', 20, 1000, 'Under Heavy Load - too many accounts created');
}
```

## Example

This is integrated into the Meteor-Throttle example:

* http://throttle-example.meteor.com/
* https://github.com/zeroasterisk/Meteor-Throttle-Example

Project came from this forum post:

https://forums.meteor.com/t/how-to-use-zeroasterisks-throttle-with-softwareros-accountstemplates/2128
