require.config({
    shim: {
        'underscore': {
            exports: '_'
        },

        'backbone': {
            deps: ['underscore','jquery'],
            exports: 'Backbone'
        },

        'backbone_validations' : {
            deps: ['backbone'],
        },

        'radio': {
            exports: 'radio'
        },

        'bootstrap_modal': {
            deps: ['jquery'],
        },
    },

    paths: {
        // vendor
        backbone: 'lib/backbone',
        backbone_validations : 'lib/backbone.validations',
        underscore: 'lib/underscore',
        jquery: 'lib/jquery',
        radio: 'lib/radio',
        bootstrap_modal: 'lib/bootstrap-modal',

        // core
        core: 'core/core',
        sandbox: 'core/sandbox',


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
    'modules/srpsession/srpsession',
    'modules/passwords/passwords',
    'widgets/login-modal/main',
    'widgets/add-password-modal/main',
    'widgets/main-view/main',
    'widgets/head-bar/main',
], function (Backbone, core, srpsession, passwords, loginModal, addPasswordModal, mainView, headBar) {

    console.log('Starting app');
    core.start(srpsession, './authentication');

    core.start(headBar);
    core.start(loginModal);

    core.subscribe('login', function () {
        core.stop(loginModal);
        core.start(passwords);
        core.start(addPasswordModal);
        core.start(mainView);
    });

    core.subscribe('logout', function () {
        core.stop(passwords);
        core.stop(addPasswordModal);
        core.stop(mainView);
        core.start(loginModal);
    });


    //core.broadcast('request:login','nicolas','test');
});
