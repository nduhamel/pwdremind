requirejs([
    'sandbox',
    'widgets/head-bar/main',
    'widgets/login-modal/main',
    'widgets/password-modal/main',
    'widgets/note-modal/main',
    'modules/srpsession/srpsession',
    'modules/ressources/main',
    'applications/passwordList/main',
    'applications/passwordVizualizer/main',
    'applications/noteList/main',
    'applications/exporter/main'
], function (sandbox, HeadBar, LoginModal, PasswordModal, NoteModal) {
    var headBar,
        modal;

    var addPassword = function () {
        var categories = sandbox.require('passwordCategories'),
            PasswordModel = categories.getRessourceModel();
        modal = new PasswordModal({collection : categories, model : new PasswordModel({category_id: categories.getCurrentCatId() }) } );
        modal.render();
    };

    var editPassword = function (password) {
        var categories = sandbox.require('passwordCategories');
        modal = new PasswordModal({collection : categories, model : password });
        modal.render();
    };

    var addNote = function () {
        var categories = sandbox.require('noteCategories'),
            NoteModel = categories.getRessourceModel();
        modal = new NoteModal({collection: categories, model: new NoteModel({category_id: categories.getCurrentCatId() }) } );
        modal.render();
    };

    var editNote = function (note) {
        var categories = sandbox.require('noteCategories');
        modal = new NoteModal({collection: categories, model: note});
        modal.render();
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
        sandbox.startModule('ressources');
        modal.destroy();
        modal = null;
        sandbox.on('request:add-password', addPassword);
        sandbox.on('request:edit-password', editPassword);
        sandbox.on('request:addNote', addNote);
        sandbox.on('request:editNote', editNote);
    });

    sandbox.on('logout:after', function () {
        location.reload();
    });

    // For testing
    sandbox.trigger('request:login','nicolas','test');
});
