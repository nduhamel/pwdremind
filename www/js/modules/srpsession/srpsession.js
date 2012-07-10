define([
    'underscore',
    'backbone',
    'sandbox',
    './libsrp/session',
    './cryptedsync'
], function(_, Backbone, sandbox, Authenticator, cryptedSync){

    var defaultSync = Backbone.sync;

    var srpSession = {};

    srpSession.onLogin = function (credential) {
        console.log('Install crypted sync');
        Backbone.sync = cryptedSync(credential.key, credential.macKey);
        sandbox.broadcast('login');
    };

    srpSession.onFail = function () {
        sandbox.broadcast('login_failed');
    };

    srpSession.requestLogin = function (username, password) {
        //~ console.log('Request login: '+username+':'+password);
        var auth = new Authenticator(srpSession.authUrl, _.bind(srpSession.onLogin, srpSession ), srpSession.onFail);
        auth.start(username, password);
    };

    srpSession.requestLogout = function () {
        console.log('Request logout');
        console.log('Remove crypted sync');
        Backbone.sync = defaultSync;
    };

    // Facade
    return {

        // Options: authUrl syncUrl
        initialize : function (authUrl) {
            console.log('Init SRPsession');
            srpSession.authUrl = authUrl;
            sandbox.subscribe('request_login', srpSession.requestLogin, srpSession);
            sandbox.subscribe('request_logout', srpSession.requestLogout, srpSession);
        },

        reload : function () {
            console.log('Reload SRPsession');
            console.log('Remove crypted sync');
            Backbone.sync = defaultSync;
        },

        destroy : function () {
            console.log('Destroy SRPsession');
            console.log('Remove crypted sync');
            Backbone.sync = defaultSync;
            sandbox.unsubscribe('request_login', srpSession.requestLogin);
            sandbox.unsubscribe('request_logout', srpSession.requestLogout);
        },
    };
});