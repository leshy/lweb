// Generated by CoffeeScript 1.4.0
(function() {
  var Backbone, CollectionExposer, Select, SubscriptionMan2, Validator, callbackMsgEnd, collections, helpers, mongo, shared, v, _;

  Backbone = require('backbone4000');

  _ = require('underscore');

  helpers = require('helpers');

  Validator = require('validator2-extras');

  v = Validator.v;

  Select = Validator.Select;

  SubscriptionMan2 = require('./../subscriptionman2').SubscriptionMan2;

  collections = require('collections');

  mongo = require('collections/serverside/mongodb');

  shared = require('../shared');

  callbackMsgEnd = function(reply) {
    return function(err, data) {
      return reply.end({
        err: err,
        data: data
      });
    };
  };

  _.extend(exports, shared = require('./shared'));

  CollectionExposer = exports.CollectionExposer = Backbone.Model.extend4000({
    defaults: {
      name: void 0
    },
    initialize: function() {
      var lweb, name,
        _this = this;
      name = this.get('name');
      lweb = this.get('lweb');
      lweb.subscribe({
        collection: name,
        create: true
      }, function(msg, reply) {
        return _this.create(msg.create, callbackMsgEnd(reply));
      });
      lweb.subscribe({
        collection: name,
        remove: true
      }, function(msg, reply) {
        return _this.findModels(msg.remove, {}, function(entry) {
          if (entry != null) {
            return entry.remove();
          } else {
            return reply.end();
          }
        });
      });
      lweb.subscribe({
        collection: name,
        update: true,
        data: true
      }, function(msg, reply) {
        var counter;
        console.log("collection got update request", msg);
        counter = 0;
        return _this.findModels(msg.update, {}, function(entry) {
          if (!entry) {
            return reply.end({
              updated: counter
            });
          }
          entry.update(msg.data);
          entry.flush(function() {
            return true;
          });
          return counter++;
        });
      });
      lweb.subscribe({
        collection: name,
        find: true
      }, function(msg, reply) {
        return _this.find(msg.find, msg.limits || {}, function(entry) {
          if (entry != null) {
            return reply.write({
              data: entry,
              err: void 0
            });
          } else {
            return reply.end();
          }
        });
      });
      lweb.subscribe({
        collection: name,
        findOne: true
      }, function(msg, reply) {
        return _this.findOne(msg.findOne, function(err, entry) {
          if (entry != null) {
            return reply.end({
              data: entry,
              err: void 0
            });
          } else {
            return reply.end();
          }
        });
      });
      return lweb.subscribe({
        collection: name,
        call: true,
        data: true
      }, function(msg, reply, realm) {
        return _this.fcall(msg.call, msg.args || [], msg.data, realm, function(err, data) {
          return reply.end({
            err: err,
            data: data
          });
        });
      });
    }
  });

  exports.MongoCollection = mongo.MongoCollection.extend4000(CollectionExposer, collections.ReferenceMixin, collections.ModelMixin, shared.SubscriptionMixin);

}).call(this);
