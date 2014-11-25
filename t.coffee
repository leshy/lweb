Lwebs = require './serverside'
Lwebc = require './clientside'
shared = require './shared'
helpers = require 'helpers'
# this is just a sketch..
# the idea is to keep things fast and simple,
# channel broadcasts and easy and simmetric JSON query/response system, supporting multiple messages in a response.

express = require 'express'
Http = require 'http'

port = 8192

gimmeEnv = (callback) ->
    app = express()
    app.configure ->
        app.set 'view engine', 'ejs'
        app.use express.favicon()
        app.use express.bodyParser()
        app.use express.methodOverride()
        app.use express.cookieParser()
        app.use app.router
        app.use (err, req, res, next) ->
            res.send 500, 'BOOOM!'

    http = Http.createServer app
    
    # I dont know why but I need to cycle ports, maybe http doesn't fully close, I don't know man.
    http.listen ++port 

    lwebs = new Lwebs.lweb http: http, verbose: true
    lwebc = new Lwebc.lweb host: 'http://localhost:' + port, verbose: true
    
    lwebs.server.on 'connection', ->
        callback lwebs, lwebc, http, (test) ->
            lwebc.socket.disconnect()
            http.close -> test.done()


gimmeEnv (lwebs,lwebc,http,done) ->
    console.log 'got env'

    lwebs.query.subscribe bla: true, (msg,res,client) ->
        console.log "server got query",msg
        res.write({res: 1})
        res.end({res: 666})
        
    lwebc.query.query bla: 3, (msg,end) ->
        console.log "client got response",msg,end
        