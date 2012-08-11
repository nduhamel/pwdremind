define([
    'underscore',
    'backbone',
    'sandbox',
    './libsrp/session',
    './cryptedsync'
], function(_, Backbone, sandbox, Authenticator, cryptedSync){

    sandbox.defineModule({

        name : 'srpsession',

        start : function (options) {
            this.authUrl = options.authUrl;
            this.defaultSync = Backbone.sync;
            this.sandbox.on('request:login', this.requestLogin, this);
            this.sandbox.on('request:logout', this.requestLogout, this);
            this.sandbox.on('logout', this.onLogout, this);
        },

        stop : function () {
            Backbone.sync = this.defaultSync;
            this.sandbox.off('request:login', this.requestLogin, this);
            this.sandbox.off('request:logout', this.requestLogout, this);
            this.sandbox.off('logout', this.onLogout, this);
        },

        requestLogin : function (username, password) {
            var auth = new Authenticator(this.authUrl, _.bind(this.onLogin, this ), _.bind(this.onFail, this ));
            auth.start(username, password);
        },

        onLogin : function (credential) {
            //~ console.log('Install crypted sync');
            Backbone.sync = cryptedSync(credential.key, credential.macKey);
            this.sandbox.trigger('login');
        },

        onFail : function () {
            this.sandbox.trigger('login:failed');
        },

        requestLogout : function () {
            //~ console.log('Request logout');
            //~ console.log('Remove crypted sync');
            this.sandbox.trigger('logout');
        },

        onLogout : function () {
            Backbone.sync = this.defaultSync;
        },
    });
});
