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

        'radio': {
            exports: 'radio'
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
        radio: 'lib/radio',
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
             srpsession,
             passwords,
             notes,
             applications,
             loginModal,
             addPasswordModal,
             addCategoryModal,
             addNoteModal,
             headBar,
             passwordApp,
             noteApp,
             sidebar,
             notify) {

    console.log('Starting app');
    core.start(srpsession, './authentication');

    core.start(headBar);
    core.start(notify);
    core.start(loginModal);
    core.start(applications);
    core.start(passwordApp);
    core.start(noteApp);
    core.start(sidebar);

    core.subscribe('login', function () {
        core.stop(loginModal);
        core.start(passwords);
        core.start(notes);
        core.start(addPasswordModal);
        core.start(addNoteModal);
        core.start(addCategoryModal);
        core.broadcast('start:Notify');
        core.broadcast('start:SidebarView','#main-view-sidebar');
    });

    core.subscribe('logout', function () {
        core.stop(passwords);
        core.stop(addPasswordModal);
        core.stop(notes);
        core.stop(addNoteModal);
        core.stop(addCategoryModal);
        core.start(loginModal);
    });


    core.broadcast('request:login','nicolas','test');
});
