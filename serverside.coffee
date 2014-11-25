io = require 'socket.io'
Backbone = require 'backbone4000'
helpers = require 'helpers'
_ = require 'underscore'

SubscriptionMan = require('subscriptionman2')
validator = require('validator2-extras'); v = validator.v

# inherit code common to serverside and clientside
_.extend exports, shared = require './shared'

Channel = SubscriptionMan.fancy.extend4000
    initialize: () ->
        @name = @get 'name' or throw 'channel needs a name'
        @clients = {}

    join: (client) ->
        console.log 'join to', @name, client.id
        @clients[client.id] = client
        client.on 'disconnect', => @part client
        
    part: (client) ->
        console.log 'part from', @name, client.id
        delete @clients[client.id]
        if _.isEmpty @clients then @del() # garbage collect the channel
    
    broadcast: (msg, exclude) ->
        @event msg
        _.map @clients, (subscriber) => if subscriber isnt exclude then subscriber.emit(@name, msg)
        
    del: ->
        @clients = {}
        @trigger 'del'


# this is the pub/sub core. it should be easy to extend to use zeromq or redis or something if I require horizontal scalability.
ChannelServer = shared.channelInterface.extend4000
    ChannelClass: Channel
    
    initialize: ->
        @channels = {}
        
    broadcast: (channelname,msg) ->
        console.log 'broadcast',channelname,msg
        if not channel = @channels[channelname] then return
        channel.broadcast msg

    join: (channelname,client) ->
        @channel(channelname).join client

    part: (channelname,socket) ->
        if not channel = @channels[channelname] then return
        channel.part socket

lweb = exports.lweb = validator.ValidatedModel.extend4000 SubscriptionMan.fancy,
    initialize: ->
        @verbose = @get('verbose') or @parent.verbose or false
        http = @get 'http'
        if not http then throw "I need http instance in order to listen"
        @query = new shared.queryServer parent: @
        @server = io.listen http, log: false # turning off socket.io logging

        # this kinda sucks, I'd like to hook messages on the server object level,
        # not create 4 new callbacks per client.. investigate.
        @server.on 'connection', (client) => 
            id = client.id
            host = client.handshake.address.address
            
#            console.log 'got connection from', host, id

            realm = {}
            realm.client = client
            
            # channels
            #client.on 'join', (msg) => @join msg.channel, client
            #client.on 'part', (msg) => @part msg.channel, client

            # queries
            client.on 'msg', (msg) => @event msg, realm, client
#            client.on 'reply', (msg) => @event _.extend({ type: 'reply' }, msg), realm, client
#            client.on 'queryCancel', (msg) => @event _.extend({ type: 'queryCancel' }, msg), realm, client
        # just a test channel broadcasts
        ###
        testyloopy = =>
            @broadcast 'testchannel', ping: helpers.uuid()
            helpers.sleep 10000, testyloopy
        testyloopy()
        ###
        console.log 'lwebs done'
