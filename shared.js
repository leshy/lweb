// Generated by CoffeeScript 1.4.0
(function() {
  var Backbone, SimpleMatcher, SubscriptionMan, channelInterface, lwebInterface, _;

  Backbone = require('backbone4000');

  _ = require('underscore');

  SimpleMatcher = Backbone.Model.extend4000({
    match: function(value, pattern) {
      if (pattern === true) {
        return true;
      }
      return true;
    }
  });

  SubscriptionMan = exports.SubscriptionMan = SimpleMatcher.extend4000({
    initialize: function() {
      var cnt;
      cnt = 0;
      return this.subscriptions = [];
    },
    subscribe: function(pattern, callback, name) {
      return this.subscriptions.push({
        pattern: pattern,
        callback: callback
      });
    },
    event: function(value) {
      var subscriptions,
        _this = this;
      subscriptions = _.filter(this.subscriptions, function(subscription) {
        return _this.match(value, subscription.pattern);
      });
      return _.map(subscriptions, function(subscription) {
        return subscription.callback(value);
      });
    }
  });

  channelInterface = exports.channelInterface = SubscriptionMan.extend4000({
    broadcast: function(channel, message) {
      return true;
    },
    subscribe: function(channel, listener) {
      return true;
    },
    unsubscribe: function(channel, listener) {
      return true;
    },
    del: function() {
      return true;
    }
  });

  lwebInterface = exports.lwebInterface = Backbone.Model.extend4000({
    initialize: function() {
      return true;
    },
    query: function(msg) {
      return true;
    }
  });

}).call(this);
