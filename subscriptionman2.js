// Generated by CoffeeScript 1.4.0
(function() {
  var Backbone, SimpleMatcher, SubscriptionMan2, _,
    __slice = [].slice;

  Backbone = require('backbone4000');

  _ = require('underscore');

  SimpleMatcher = Backbone.Model.extend4000({
    match: function(value, pattern) {
      if (pattern === true) {
        return true;
      }
      return !_.find(pattern, function(checkvalue, key) {
        if (!value[key]) {
          return true;
        }
        if (checkvalue !== true && value[key] !== checkvalue) {
          return true;
        }
        return false;
      });
    }
  });

  SubscriptionMan2 = exports.SubscriptionMan2 = SimpleMatcher.extend4000({
    initialize: function() {
      this.counter = 0;
      return this.subscriptions = {};
    },
    subscribe: function(pattern, callback, name) {
      var _this = this;
      if (name == null) {
        name = this.counter++;
      }
      if (!callback && pattern.constructor === Function) {
        callback = pattern;
        pattern = true;
      }
      this.subscriptions[name] = {
        pattern: pattern,
        callback: callback
      };
      return function() {
        delete _this.subscriptions[name];
        return _this.trigger('unsubscribe', name);
      };
    },
    event: function() {
      var MatchedSubscriptions, value, values,
        _this = this;
      values = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      value = _.first(values);
      MatchedSubscriptions = _.filter(_.values(this.subscriptions), function(subscription) {
        return _this.match(value, subscription.pattern);
      });
      return _.map(MatchedSubscriptions, function(subscription) {
        return subscription.callback.apply(this, values);
      });
    }
  });

}).call(this);
