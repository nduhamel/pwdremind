define(['backbone', 'sandbox'], function(Backbone, sandbox){

    var HistoryModel = Backbone.Model.extend({
        crypted : ['action', 'model', 'uri', 'modelLabel', 'modelId'],
        urlRoot : './history'
    });

    var HistoryCollection = Backbone.Collection.extend({
        model: HistoryModel,
        url: './history'
    });

    var actionMap = {
        'create': 'delete',
        'delete': 'create',
        'update': 'update'
    };

    var methodWatched = ['create', 'delete', 'update'];

    var syncProxy = function(sync, memonize) {
        return function (method, model, options) {
            var success = options.success;
            options.success = function(resp, status, xhr) {
                if (success) {
                    success(resp, status, xhr);
                }
                var keep = _.has(options, 'keepInHistory') ? options.keepInHistory : model.keepInHistory;
                if (keep && _.include(methodWatched, method)) {
                    var modelAttr;
                    if (method === 'update') {
                        if (!model.previousServerAttr) {
                            throw 'previousServerAttr not defined';
                        }
                        modelAttr = model.previousServerAttr;
                    } else {
                        modelAttr = model.toJSON();
                    }
                    memonize({
                            'action': method,
                            'model': modelAttr,
                            'uri': model.uri,
                            'modelLabel': model.get(model.historyLabel),
                            'modelId': model.id
                    });
                }
            };

            sync(method, model, options);
        };
    };

    sandbox.defineModule({

        name : 'ressourcesHistory',

        provide: ['history'],

        start : function () {
            this.defaultSync = Backbone.sync;
            this.history = new HistoryCollection();
            this.history.fetch();
            Backbone.sync = syncProxy(this.defaultSync, _.bind(this.add,this));
            sandbox.on('history:undo', this.doUndo, this);
        },

        stop : function () {
            sandbox.off(null,null,this);
            Backbone.sync = this.defaultSync;
            this.history.off(null,null,this);
            delete this.defaultSync;
            delete this.history;
        },

        add : function (attr) {
            var dups = this.history.where({'modelId': attr.modelId});
            _.each(dups, function(model){
                model.destroy();
            });
            if (attr.action === "delete") {
                attr.modelId = null;
                delete attr.model.id;
            }
            var model = new this.history.model(attr);
            model.save(null,{
                success: _.bind(function(model){
                    this.history.add(model);
                },this)
            });
        },

        doUndo : function (id) {
            var entry = this.history.get(id),
                action = actionMap[entry.get('action')],
                uri = entry.get('uri'),
                attr = entry.get('model');
            sandbox.trigger('ressource:'+uri+':'+action, attr, function(){
                entry.destroy();
            });
        },

    });

});
