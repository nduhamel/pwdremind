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
        backbone_forms : 'lib/backbone-forms',
        underscore: 'lib/underscore',
        jquery: 'lib/jquery',
        jquery_sortable : 'lib/jquery.sortable',
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

requirejs([
    'sandbox',
    'widgets/head-bar/main',
    'widgets/login-modal/main',
    'widgets/category-modal/main',
    'widgets/add-edit-modal/main',
    'modules/srpsession/srpsession',
    'modules/ressources/main',
    'modules/ressourcesHistory/main',
    'modules/ping/main',
    'modules/idleTimer/main',
    'applications/history/main',
    'applications/passwordList/main',
    'applications/passwordVizualizer/main',
    'applications/noteList/main',
    'applications/exporter/main'
], function (sandbox, HeadBar, LoginModal, CategoryModal, AddEditModal) {
    var headBar,
        modal;

    var addPassword = function () {
        var categories = sandbox.require('passwordCategories'),
            PasswordModel = categories.getRessourceModel();
        modal = new AddEditModal({model : new PasswordModel({category_id: categories.getCurrentCatId() }) } );
        modal.render();
    };

    var editPassword = function (password) {
        modal = new AddEditModal({model : password });
        modal.render();
    };

    var addNote = function () {
        var categories = sandbox.require('noteCategories'),
            NoteModel = categories.getRessourceModel();
        modal = new AddEditModal({model: new NoteModel({category_id: categories.getCurrentCatId() }) } );
        modal.render();
    };

    var editNote = function (note) {
        modal = new AddEditModal({model: note});
        modal.render();
    };

    var addCategory= function (categories) {
        view = new CategoryModal({collection : categories, model : new categories.model() } );
        view.render();
    };

    var editCategory= function (categories, cat) {
        view = new CategoryModal({collection : categories, model : cat } );
        view.render();
    };

    var errorModal = function (html) {
        console.log(html);
    };

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

    headBar = new HeadBar();
    headBar.render();

    modal = new LoginModal();
    modal.render();

    sandbox.on('login', function () {
        sandbox.startModule('ping', {
            url: './ping',
            interval: 60*2
        });
        sandbox.startModule('idleTimer',{
            timeout: 60*3
        });
        sandbox.on('idleTimer:timeout', function () {
            sandbox.trigger('logout');
        });
        sandbox.startModule('ressources');
        sandbox.startModule('ressourcesHistory');
        modal.destroy();
        modal = null;
        sandbox.on('request:add-password', addPassword);
        sandbox.on('request:edit-password', editPassword);
        sandbox.on('request:addNote', addNote);
        sandbox.on('request:editNote', editNote);
        sandbox.on('request:addPasswordCategory', _.bind(addCategory, null, sandbox.require('passwordCategories')));
        sandbox.on('request:addNoteCategory', _.bind(addCategory, null, sandbox.require('noteCategories')));
        sandbox.on('request:editPasswordCategory', _.bind(editCategory, null, sandbox.require('passwordCategories')));
        sandbox.on('request:editNoteCategory', _.bind(editCategory, null, sandbox.require('noteCategories')));
        sandbox.on('request:errorModal', errorModal);
    });

    sandbox.on('logout', function () {
        location.reload();
    });

    // For testing
    sandbox.trigger('request:login','nicolas','test');
});
