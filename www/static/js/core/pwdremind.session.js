(function() {

    if( Pwdremind.BigInt == undefined ){
        throw "Pwdremind.Session requires Pwdremind.BigInt";
    };

    if( Pwdremind.Crypto.Srp == undefined ){
        throw "Pwdremind.Session requires Pwdremind.Crypto.Srp";
    };

    if( Pwdremind.Crypto.hmac == undefined ){
        throw "Pwdremind.Session requires Pwdremind.Crypto.sha1";
    };

    Pwdremind.Session = {};

    function Authenticator(url, optauthCallback, optauthFail) {
        var auth = this; //don't forget your self
        var url = url;
        var salt = null;
        var authCallback = optauthCallback;
        var authFail = optauthFail;

        this.start = function (username, password) {
            var nonce = Pwdremind.Crypto.random(Pwdremind.Crypto.Srp.Options.strengthBits);
            auth.srpSession = Pwdremind.Crypto.Srp.createSession(username,password,nonce);

            auth.srpSession.computeClientPublicKey(nonce);

            auth.data = {
                username : username,
                A : auth.srpSession.computeClientPublicKey(nonce)
            };

            $.post(url, auth.data, auth.afterPublicKeyExchange)
            .error(function(){
                authFail({
                    status:'ERROR',
                    reason:'SERVER_CONNECTION_FAILURE'
                });
            });
        };

        this.afterPublicKeyExchange = function(response) {
            response = JSON.parse(response);
            if (response.status == 'OK') {
                salt = response.salt;
                auth.srpSession.computeSessionKey(response.salt, response.B);
                auth.data.M1 = auth.srpSession.computeClientProof();
                $.post(url, auth.data, auth.afterVerify)
                .error(function(){
                    authFail({
                        status:'ERROR',
                        reason:'SERVER_CONNECTION_FAILURE'
                    });
                });
                return;
            }
            authFail({
                status:'ERROR',
                reason:'UNKNOWN'
            });
        };

        this.afterVerify = function(response) {
            response = JSON.parse(response);
            if (response.status == 'OK') {
                if (auth.srpSession.verifyServerProof(response.M2)) {
                    authCallback({
                        status:'OK',
                        salt: salt,
                        macKey:auth.srpSession.getMacKey(),
                    });
                    return;
                } else {
                    authFail({
                        status:'ERROR',
                        reason:'SERVER_AUTHNETICATION_FAILURE'
                    });
                    return;
                }
            }
            authFail({
                status:'ERROR',
                reason:'UNKNOWN'
            });
        };
    };

    function sign (str, macKey) {
        return Pwdremind.Crypto.hmac(new Pwdremind.BigInt().fromUtfString(str).toHex(), macKey);
    }

    function Session(setupOptions) {
        var options = setupOptions;
        var userCreditial = null;

        // Options: authSuccess authFailure authUrl syncUrl
        this.setup = function(setupOptions) {
            options = setupOptions;
        };

        function onSuccess (password) {
            return function (response) {
                userCreditial = {
                    key: Pwdremind.Crypto.pbkdf2(password, response.salt),
                    macKey: response.macKey,
                };
                options.authSuccess();
            };
        }

        this.authenticate = function(username, password) {
            auth = new Authenticator(options.authUrl, onSuccess(password), options.authFailure);
            auth.start(username, password);
            delete auth;
        };

        this.send = function (data, httpCallback) {
            if (!isOpen()){ throw "Session not opened"; }
            $.get(options.syncUrl, data, function(responseData){
                var result = {};
                try {
                    var response = JSON.parse(responseData);

                    if ( response.data ){
                        if (slowEquals(response.sig, sign(response.data))) {
                            result.status = 'OK';
                            result.data = JSON.parse(response.data);
                        }else{
                            result.status = 'ERROR';
                            result.data = null;
                            result.msg = 'MESSAGE_AUTHENTICATION_FAILURE';
                        }
                    } else if ( response.status == 'ERROR' ){
                        result.status = 'ERROR';
                        result.data = null;
                        result.msg = response.msg;
                    } else if ( response.msg ){
                        result.status = 'OK';
                        result.data = response.msg;
                    } else {
                        result.status = 'ERROR';
                        result.data = null;
                        result.msg = 'MESSAGE_FORMAT_ERROR';
                    }
                } catch (e) {
                    console.log(e);
                    result.status = 'ERROR';
                    result.data = null;
                    result.msg = 'MESSAGE_FORMAT_ERROR';
                }

                httpCallback(result);
            });
        }

        this.encrypt = function (str) {
            if (!isOpen()){ throw "Session not opened"; }
            return Pwdremind.Crypto.encrypt(userCreditial.key, str);
        }

        this.decrypt = function (ct) {
            if (!isOpen()){ throw "Session not opened"; }
            return Pwdremind.Crypto.decrypt(userCreditial.key, ct);
        }

        function sign (msg) {
            if (!isOpen()){ throw "Session not opened"; }
            return Pwdremind.Crypto.hmac(new Pwdremind.BigInt().fromUtfString(msg).toHex(), userCreditial.macKey);
        }

        this.sign = function (msg) {
            return sign(msg);
        }

        this.close = function () {
            userCreditial = null;
        }

        function isOpen () {
            return userCreditial !== null;
        }
        this.isOpen = isOpen;

        function slowEquals(A,B) {
            var equals = A.length - B.length;
            var len = Math.min(A.length, B.length);
            for (var i=0;i<len;i++) {
                equals = equals | A.charCodeAt(i)-B.charCodeAt(i);
            }
            return equals == 0;
        }
    };

    Pwdremind.Session = Session;

}());
