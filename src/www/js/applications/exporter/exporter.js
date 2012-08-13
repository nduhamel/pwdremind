define([
    'underscore',
    'sandbox',
    'backbone',
], function(_, sandbox, Backbone){

    var JSON2CSV = function (JSON) {
        var str = '';

        for (var i = 0; i < JSON.length; i++) {
            var line = '';

            for (var index in JSON[i]) {
                line += '"'+ JSON[i][index].replace(/"/g,'""') + '",';
            }

            line = line.slice(0,line.length-1);
            str += line + '\r\n';
        }
        return str;
    };


    var Exporter = function (options) {
        this.options = options.options;
        this.ressourcesQueue = _.keys(options.ressources);
        this.ressources = options.ressources;
    };

    _.extend(Exporter.prototype, Backbone.Events, {

        start : function () {
            this.trigger('started');
            this._next();
        },

        _next : function () {
            if (_.isEmpty(this.ressourcesQueue)) {
                this.trigger('finished');
                return;
            }
            var ressource = this.ressourcesQueue.pop();
            this._handleRessource(this.ressources[ressource], ressource);
        },

        _handleRessource : function (categories, name) {
            var finalize = _.after(categories.length, _.bind(this.renderDataType,this,name));
            var ressource = sandbox.require(name+'Categories');
            _.each(categories, function (catId) {
                    this.data = ressource.getRessourceCollection().reset();
                    this.data.setCategoryId(catId, {noFetch:true})
                             .fetch({noDecrypt: true, add: true, success:finalize});
            }, this);
        },

        renderDataType : function (name) {
            var data = JSON2CSV(this.data.toJSON());
            this.trigger('newFile', name, data);
            this.data.categories.reset();
            this.data.categories.fetchInit();
            this._next();
        },

    });

    return Exporter;
});
