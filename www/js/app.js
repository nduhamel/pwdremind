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
    'sandbox',
    'widgets/head-bar/main',
    'modules/srpsession/srpsession',
    'modules/ressources/main',
    //~ 'widgets/login-modal/main',
    //~ 'widgets/add-password-modal/main',
    //~ 'widgets/add-category-modal/main',
    //~ 'widgets/add-note-modal/main',
    'applications/passwordList/main',
    'applications/noteList/main',
    //~ 'widgets/sidebar/main',
    //~ 'widgets/notify/main',
    //~ 'widgets/passwords-vizualizer/main',
    //~ 'widgets/exporter/main'
], function (sandbox, HeadBar) {

    console.log('Starting app');

    sandbox.configure({
        appEl : 'div[name="application"]',
        defaultContext : 'password',
        context : {
            password : {
                label : 'Passwords',
                icon : 'icon-briefcase',
                order : 0,
                defaultApp : 'passwordList'
            },
            note : {
                label : 'Notes',
                icon : 'icon-pencil',
                order : 1,
                defaultApp : 'noteList'
            }
        }
    });

    sandbox.startModule('srpsession', {authUrl:'./authentication'});

    var headBar = new HeadBar();
    headBar.render();

    sandbox.on('login', function () {
        sandbox.startModule('ressources');
    });

    sandbox.on('logout:after', function () {
        location.reload();
    });

    // For testing
    sandbox.trigger('request:login','nicolas','test');
});
