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
        }
    },

    paths: {
        // vendor
        backbone: 'lib/backbone',
        backbone_validation : 'lib/backbone.validation',
        backbone_model_binder : 'lib/Backbone.ModelBinder',
        underscore: 'lib/underscore',
        jquery: 'lib/jquery',
        bootstrap_modal: 'lib/bootstrap-modal',
        zeroclipboard : 'lib/ZeroClipboard',

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
    'modules/passwords/passwords',
    'modules/notes/notes',
    'modules/applications/main',
    'widgets/login-modal/main',
    'widgets/add-password-modal/main',
    'widgets/add-category-modal/main',
    'widgets/add-note-modal/main',
    'widgets/head-bar/main',
    'widgets/password-app/main',
    'widgets/note-app/main',
    'widgets/sidebar/main',
    'widgets/notify/main'
], function (Backbone,
             core,
             sandbox,
             srpsession,
             passwords,
             notes,
             applications) {

    console.log('Starting app');
    core.start(applications);
    core.start(srpsession, './authentication');

    core.broadcast('bootstrap');

    core.subscribe('login', function () {
        core.start(passwords);
        core.start(notes);
    });

    //~ core.subscribe('logout', function () {
        //~ core.stop(passwords);
        //~ core.stop(notes);
        //~ core.stop(applications);
    //~ });

    core.broadcast('request:login','nicolas','test');
});
