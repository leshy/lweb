Backbone = require 'backbone4000'
_ = require 'underscore'
helpers = require 'helpers'

validator = require('validator2-extras'); v = validator.v

SubscriptionMan = exports.SubscriptionMan = require('subscriptionman2')

channelInterface = exports.channelInterface = Backbone.Model.extend4000
    initialize: ->
        @channels = {}

    channel: (channelname) ->
        if channel = @channels[channelname] then return channel
        channel = @channels[channelname] = new @ChannelClass lweb: @, name: channelname
        channel.once 'del', => delete @channels[channelname]
        return channel

    channelsubscribe: (channelname, pattern, callback) ->
        channel = @channel(channelname)
        if not callback and pattern.constructor is Function then callback = pattern; pattern = true
        channel.subscribe pattern, callback

    broadcast: (channel,message) -> true
    join: (channel,listener) -> true
    part: (channel,listener) -> true
    del: -> true      

Response = Backbone.Model.extend4000
    constructor: (@id, @client, @parent) ->
        @verbose = @parent.verbose
        if not client.responses then client.responses = {}
        client.responses[@id] = @
#        Backbone.Model.apply @
        
    write: (payload) ->
        if @ended then console.warn 'writing to ended query',payload; return
        if not payload then throw 'no payload'
        if @verbose then console.log "<",@id,payload
        @client.emit 'msg', { type: 'reply', id: @id, payload: payload }

    end: (payload) ->
        if @ended then console.warn 'ending ended query',payload; return
        if @verbose then console.log "<<",@id, payload
        @ended = true        
        msg = { type: 'reply', id: @id, end: true }
        if payload then msg.payload = payload
        @client.emit 'msg', msg
        delete @client.responses[@id]
        @trigger 'end'

    cancel: -> 
        @trigger 'cancel'; @end()


queryClient = exports.queryClient = validator.ValidatedModel.extend4000
    validator:
        parent: 'Instance'

    initialize: ->
        @callbacks = {}
        @parent = @get 'parent'
        @verbose = @get('verbose') or @parent.verbose or false
        @parent.subscribe { type: 'reply', id: String }, (msg) =>
            @callbacks[msg.id]?(msg.payload,msg.end or false)

            
    query: (payload,callback) ->
        console.log "QUERY",payload
        if not payload then return console.warn 'tried to send a message without payload'
        @parent.send type: 'query', id: id = helpers.uuid(10), payload: payload
        @callbacks[id] = callback


# as parent it expects something with send and receive methods that's a subclass of subscriptionman
queryServer = exports.queryServer = validator.ValidatedModel.extend4000 SubscriptionMan.fancy,
    validator:
        parent: 'Instance'
    
    initialize: ->
        @parent = @get 'parent'
        @verbose = @get('verbose') or @parent.verbose or false
        
        @parent.subscribe { type: 'query', id: String, payload: true }, (msg,realm,client) =>
            if @verbose then console.log '>',msg.id,msg.payload
                
            response = new Response msg.id, client, @
            matches = @event msg.payload, response, realm
            
            if not matches then delete client.responses[msg.id]

        @parent.subscribe { type: 'queryCancel', id: String }, (msg,realm,client) =>
            if @verbose then console.log 'X',msg.id
            client.responses[msg.id]?.cancel()
        
    subscribe: (pattern, callback) ->
        if not callback and pattern.constructor is Function then callback = pattern and pattern = true
        SubscriptionMan.fancy::.subscribe.call @, pattern, callback
