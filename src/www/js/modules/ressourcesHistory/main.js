define(['backbone', 'sandbox'], function(Backbone, sandbox){

    var HistoryCollection = Backbone.Collection.extend({
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
                        'modelLabel': model.get(model.historyLabel)
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
            this.history.on('add', this.checkSize, this);
            Backbone.sync = syncProxy(this.defaultSync, this.history);
        },

        stop : function () {
            Backbone.sync = this.defaultSync;
            this.history.off();
            delete this.defaultSync;
            delete this.history;
        },

        checkSize : function () {
            if (this.history.length > this.maxSize) {
                this.history.pop();
            }
        }

    });

});
