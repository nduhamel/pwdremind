define(['backbone', 'sandbox'], function(Backbone, sandbox){

    var HistoryModel = Backbone.Model.extend({
        crypted : ['action', 'model', 'uri', 'modelLabel', 'modelId'],
    });

    var HistoryCollection = Backbone.Collection.extend({
        model: HistoryModel,
        url: './history'
    });

    var methodWatched = ['create', 'delete'];

    var syncProxy = function(sync, history) {
        return function (method, model, options) {
            var success = options.success;
            options.success = function(resp, status, xhr) {
                if (success) {
                    success(resp, status, xhr);
                }
                if (model.keepInHistory && _.include(methodWatched, method)) {
                    console.log('WATCHED ACTION! LOG it!');
                    var modelAttr = model.toJSON();
                    history.add({
                        'action': method,
                        'model': modelAttr,
                        'uri': model.uri,
                        'modelLabel': model.get(model.historyLabel),
                        'modelId': model.id
                    });
                    console.log(history);
                }
            };

            sync(method, model, options);
        };
    };

    sandbox.defineModule({

        name : 'ressourcesHistory',

        provide: ['history'],

        maxSize : 3,

        start : function () {
            this.defaultSync = Backbone.sync;
            this.history = new HistoryCollection();
            this.history.fetch();
            this.history.on('add', this.postAdd, this);
            Backbone.sync = syncProxy(this.defaultSync, this.history);
        },

        stop : function () {
            Backbone.sync = this.defaultSync;
            this.history.off();
            delete this.defaultSync;
            delete this.history;
        },

        postAdd : function (model) {
            var toRemove;
            model.save();
            if (this.history.length > this.maxSize) {
                toRemove = this.history.pop();
                toRemove.destroy();
            }
        }

    });

});
