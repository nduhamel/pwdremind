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

if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}

// Starts main
requirejs([
    'backbone',
    'core',
    'sandbox',
    'modules/srpsession/srpsession',
    'modules/ressources/main',
    'modules/applications/main',
    'widgets/login-modal/main',
    'widgets/add-password-modal/main',
    'widgets/add-category-modal/main',
    'widgets/add-note-modal/main',
    'widgets/head-bar/main',
    'widgets/password-app/main',
    'widgets/note-app/main',
    'widgets/sidebar/main',
    'widgets/notify/main',
    'widgets/passwords-vizualizer/main',
    'widgets/exporter/main'
], function (Backbone,
             core,
             sandbox,
             srpsession,
             ressources,
             applications) {

    console.log('Starting app');
    core.start(applications);
    core.start(srpsession, './authentication');

    core.broadcast('bootstrap');

    core.subscribe('login', function () {
        core.start(ressources);
    });

    core.subscribe('logout:after', function () {
        location.reload();
    });

    core.broadcast('request:login','nicolas','test');
});
