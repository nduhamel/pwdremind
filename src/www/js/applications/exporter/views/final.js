define([
    'sandbox',
    'backbone',
    '../exporter',
    'filesaver',
    'text!../tpl/final.html',
    'text!../tpl/file.html',
], function(sandbox, Backbone, Exporter, saveAs, baseTpl, fileTpl){

    return sandbox.WidgetView.extend({

        events : {
            "click svg" : 'onClick',
        },

        fileTemplate : _.template(fileTpl, null, { variable: 'file'}),

        initialize : function () {
            var opts = this.options.exportOptions.options;
            var ressources = _.pick(this.options.exportOptions, _.without(_.keys(this.options.exportOptions),'options'));

            this.files = new Backbone.Collection();
            this.files.on('add', this.onFileAdded, this);

            this.exporter = new Exporter({
                ressources : ressources,
                options : opts
            });

            this.exporter.on('newFile', this.onNewFile, this);
            this.exporter.start();
        },

        onDestroy : function () {
            this.files.off();
            this.exporter.off();
        },

        render : function () {
            this.$el.html(_.template(baseTpl));
            return this;
        },

        onFileAdded : function (file) {
            this.$('p').append(this.fileTemplate(file));
        },

        onNewFile : function (name, data) {
            this.files.add({name:name, data:data});
        },

        onClick : function (event) {
            event.preventDefault();
            var cid = $(event.target).attr('name');
            var file = this.files.getByCid(cid);
            var bb = new BlobBuilder;
            bb.append(file.get('data'));
            saveAs( bb.getBlob("text/plain;charset=" + document.characterSet)
                    , file.name+ ".csv"
            );
        },

    });
});
