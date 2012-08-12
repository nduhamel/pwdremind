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
        this.options = options;
        this.dataTypesQueue = _.keys(options.categories);
    };

    _.extend(Exporter.prototype, Backbone.Events, {

        start : function () {
            this.trigger('started');
            this._next();
        },

        _next : function () {
            if (_.isEmpty(this.dataTypesQueue)) {
                this.trigger('finished');
                return;
            }
            var dataType = this.dataTypesQueue.pop();
            this._handleDataType(this.options.categories[dataType], dataType);
        },

        _handleDataType : function (categoriesId, dataType) {
            this.datas.setDataType(dataType);
            var finalize = _.after(categoriesId.length, _.bind(this.renderDataType,this));
            _.each(categoriesId, function (catId) {
                    this.datas.setCategoryId(catId).fetch({noDecrypt: true, add: true, success:finalize});
            }, this);
        },

        renderDataType : function () {
            var data = JSON2CSV(this.datas.toJSON());
            this.trigger('newFile', this.datas.getDataType(), data);
            this._next();
        },

    });

    return Exporter;
});
