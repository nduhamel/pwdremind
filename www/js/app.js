require.config({
    shim: {
        'underscore': {
            exports: '_'
        },

        'backbone': {
            deps: ['underscore','jquery'],
            exports: 'Backbone'
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
    'core',
    'modules/srpsession/srpsession',
    'modules/passwords/passwords',
    'widgets/login-modal/main',
    'widgets/categories-list/main',
    'widgets/head-bar/main'
], function (core, srpsession, passwords, loginModal, categoriesList, headBar) {

    console.log('hello world');
    core.start(srpsession, './authentication');

    core.start(headBar);
    core.start(loginModal);

    core.subscribe('login', function () {
        core.stop(loginModal);
        core.start(passwords);
        core.start(categoriesList);
    });


   // core.broadcast('request_login','nicolas','test');
});
