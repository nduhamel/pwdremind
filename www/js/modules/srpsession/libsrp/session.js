define(['./srp', './crypto', 'jquery'], function ( Srp, Crypto, $) {

    function Authenticator(url, optauthCallback, optauthFail) {
        var auth = this; //don't forget your self
        var url = url;
        var salt = null;
        var authCallback = optauthCallback;
        var authFail = optauthFail;

        this.start = function (username, password) {
            auth.password = password;
            var nonce = Crypto.random(Srp.Options.strengthBits);
            auth.srpSession = Srp.createSession(username,password,nonce);

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
                        key: Crypto.pbkdf2(auth.password, salt),
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

    return Authenticator;

});
