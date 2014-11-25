// Generated by CoffeeScript 1.7.1
(function() {
  var Http, Lwebc, Lwebs, express, gimmeEnv, helpers, port, shared;

  Lwebs = require('./serverside');

  Lwebc = require('./clientside');

  shared = require('./shared');

  helpers = require('helpers');

  express = require('express');

  Http = require('http');

  port = 8192;

  gimmeEnv = function(callback) {
    var app, http, lwebc, lwebs;
    app = express();
    app.configure(function() {
      app.set('view engine', 'ejs');
      app.use(express.favicon());
      app.use(express.bodyParser());
      app.use(express.methodOverride());
      app.use(express.cookieParser());
      app.use(app.router);
      return app.use(function(err, req, res, next) {
        return res.send(500, 'BOOOM!');
      });
    });
    http = Http.createServer(app);
    http.listen(++port);
    lwebs = new Lwebs.lweb({
      http: http,
      verbose: true
    });
    lwebc = new Lwebc.lweb({
      host: 'http://localhost:' + port,
      verbose: true
    });
    return lwebs.server.on('connection', function() {
      return callback(lwebs, lwebc, http, function(test) {
        lwebc.socket.disconnect();
        return http.close(function() {
          return test.done();
        });
      });
    });
  };

  gimmeEnv(function(lwebs, lwebc, http, done) {
    console.log('got env');
    lwebs.query.subscribe({
      bla: true
    }, function(msg, res, client) {
      console.log("server got query", msg);
      res.write({
        res: 1
      });
      return res.end({
        res: 666
      });
    });
    return lwebc.query.query({
      bla: 3
    }, function(msg, end) {
      return console.log("client got response", msg, end);
    });
  });

}).call(this);
