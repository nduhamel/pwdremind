require.config({
    shim: {
        'underscore': {
            exports: '_'
        },

        'backbone': {
            deps: ['underscore','jquery'],
            exports: 'Backbone'
        },

        'backbone_validation' : {
            deps: ['backbone']
        },

        'bootstrap_modal': {
            deps: ['jquery']
        },

        'zeroclipboard' : {
            exports : 'ZeroClipboard'
        },

        'd3' : {
            exports : 'd3'
        },

        'd3_geom' : {
            deps: ['d3'],
            exports : 'd3'
        },

        'd3_layout' : {
            deps: ['d3', 'd3_geom'],
            exports : 'd3'
        },

        'blobbuilder' : {
            exports : 'BlobBuilder',
        },

        'filesaver' : {
            deps: ['blobbuilder'],
            exports : 'saveAs',
        },
    },

    paths: {
        // vendor
        backbone: 'lib/backbone',
        backbone_validation : 'lib/backbone.validation',
        backbone_model_binder : 'lib/Backbone.ModelBinder',
        underscore: 'lib/underscore',
        jquery: 'lib/jquery',
        bootstrap_modal: 'lib/bootstrap-modal',
        bootstrap_button : 'lib/bootstrap-button',
        zeroclipboard : 'lib/ZeroClipboard',
        d3 : 'lib/d3',
        d3_geom : 'lib/d3.geom',
        d3_layout : 'lib/d3.layout',
        filesaver: 'lib/FileSaver',
        blobbuilder: 'lib/BlobBuilder',

        // core
        core: 'core/core',
        sandbox: 'core/sandbox'

    }

});
