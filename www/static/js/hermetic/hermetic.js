/*
 Copyright (c) 2009 Galini Associates Ltd.

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.

 @author Antonio Caciuc, http://www.denksoft.com
 */
(function() {
    if( Hermetic == undefined ){
        throw "Hermetic.Transport requires Hermetic";
    };

    if( Hermetic.Srp == undefined ){
        throw "Hermetic.Transport requires Hermetic.Srp";
    };

    function Transport() {

        var XMLHttpFactories = [
            function () {return new XMLHttpRequest();},
            function () {return new ActiveXObject("Msxml2.XMLHTTP");},
            function () {return new ActiveXObject("Msxml3.XMLHTTP");},
            function () {return new ActiveXObject("Microsoft.XMLHTTP");}
        ];

        function createXMLHTTPObject() {
            var xmlhttp = false;
            for (var i=0;i<XMLHttpFactories.length;i++) {
                try {
                    xmlhttp = XMLHttpFactories[i]();
                }
                catch (e) {
                    continue;
                }
                break;
            }
            return xmlhttp;
        }

        this.send = function(url, dataString, httpCallback) {
            try {
                var xhr = createXMLHTTPObject();
                xhr.open("POST", url, true);
                xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
                xhr.onreadystatechange = function() {
                    if (xhr.readyState==4) {
                        if (xhr.status==200) {
                            httpCallback({
                                status:'OK',
                                data:xhr.responseText
                            });
                        } else {
                            httpCallback({
                                status:'ERROR',
                                reason:xhr.status
                            });
                        }
                    }
                };
                xhr.send(dataString);
            } catch (e) {
                httpCallback({
                    status:'ERROR',
                    reason:'UNEXPECTED_ERROR:'+e
                });
            }
        };
    };

    function Authenticator(transport, url) {
        var auth = this; //don't forget your self
        var url = url;

        var salt = null;

        auth.transport = transport;

        this.start = function (username, password, authCallback) {
            auth.callback = authCallback;
            var nonce = Hermetic.Prng.getRandomBytes(Hermetic.Srp.Options.strengthBits/8);

            auth.srpSession = Hermetic.Srp.createSession(username,password,nonce);

            auth.srpSession.computeClientPublicKey(nonce);

            auth.data = {
                username : username,
                A : auth.srpSession.computeClientPublicKey(nonce)
            };

            auth.transport.send(url, urlEncodeObject(auth.data), auth.afterPublicKeyExchange);
        };

        this.afterPublicKeyExchange = function(response) {
            if (response.status == 'OK') {
                response = JSON.parse(response.data);
                if (response.status == 'OK') {
                    salt = response.salt;
                    auth.srpSession.computeSessionKey(response.salt, response.B);
                    auth.data.M1 = auth.srpSession.computeClientProof();
                    auth.transport.send(url, urlEncodeObject(auth.data), auth.afterVerify);
                    return;
                }
            }
            auth.callback(response);
        };

        this.afterVerify = function(response) {
            if (response.status == 'OK') {
                response = JSON.parse(response.data);
                if (response.status == 'OK') {
                    if (auth.srpSession.verifyServerProof(response.M2)) {
                        var channel = auth.srpSession.getSecureChannel(response.sessionId);
                        auth.callback({
                            status:'OK',
                            secureChannel:channel,
                            salt: salt,
                        });
                        return;
                    } else {
                        auth.callback({
                            status:'ERROR',
                            reason:'SERVER_AUTHNETICATION_FAILURE'
                        });
                        return;
                    }
                }
            }
            return auth.callback(response);
        };
    };

    function urlEncodeObject(object) {
        var encoded = [];
        for(var property in object) {
            encoded.push(encodeURIComponent(property));
            encoded.push("=");
            encoded.push(encodeURIComponent(object[property]));
            encoded.push("&");
        }
        return encoded.join("");
    };

    var secure = 2;
    var authentic = 1;
    var plain = 0;

    function pack (object, secureChannel, mode) {
        var envelope = {};

        var payload = JSON.stringify(object);

        if (mode == secure) {
            payload= secureChannel.encrypt(payload);
        }

        envelope.msg = payload;

        if (mode == authentic || mode == secure) {
            envelope.sig = secureChannel.sign(payload);
        }

        envelope.sid = secureChannel.getId();

        return urlEncodeObject(envelope);
    }

    function unpack (jsonString, secureChannel, mode) {
        var result = {};
        try {
            var envelope = JSON.parse(jsonString);


            if ( mode==authentic || mode==secure ) {
                if (slowEquals(envelope.sig, secureChannel.sign(envelope.msg))) {
                    result.status = 'OK';
                    result.data = envelope.msg;
                    if(mode==secure) {
                        result.data = secureChannel.decrypt(result.data);
                    }
                } else {
                    result.status = 'ERROR';
                    result.data = null;
                    result.reason = 'MESSAGE_AUTHENTICATION_FAILURE';
                    return result;
                }
            }

            if ( mode==plain ) {
                result.status = 'OK';
                result.data = envelope.msg;
            }

            result.data = JSON.parse(result.data);
        } catch (e) {
            result.status = 'ERROR';
            result.data = null;
            result.reason = 'MESSAGE_FORMAT_ERROR';
        }
        return result;
    }

    Hermetic.Transport = Transport;

    function HermeticQuery() {
        var transport = null;
        var auth = null;
        var options = null;

        this.setup = function(setupOptions) {
            transport = new Transport();
            auth = new Authenticator(transport, setupOptions.authUrl);
            options = setupOptions;
        };

        this.authenticate = function(username, password) {

            auth.start(username, password, function(authResult) {
                if (authResult.status == 'OK') {
                    options.authSuccess(authResult.secureChannel, authResult.salt);
                } else {
                    options.authFailure(authResult);
                }
            });

        };

        this.send = function(url, data, callback, mode) {

            if (mode == undefined) { mode = hQuery.Encrypted; }

            var packMode = (mode >> 4) & 0x0F;
            var unpackMode = (mode) & 0x0F;

            data = pack( data, channel, packMode);

            transport.send(url, data,
                    function(xhrResponse) {
                        if (xhrResponse.status == 'OK') {

                            var unpackedResponse = unpack(xhrResponse.data, channel, unpackMode);

                            if (unpackedResponse.status == 'OK') {
                                callback(unpackedResponse.data, 'success');
                            } else {
                                callback(null, unpackedResponse);
                            }
                        }
                    });
        };
    };

    window.hQuery = new HermeticQuery();

    hQuery.Plain =           0x00;
    hQuery.PlainSigned =     0x01;
    hQuery.PlainEncrypted =  0x02;
    hQuery.SignedPlain =     0x10;
    hQuery.Signed =          0x11;
    hQuery.SignedEncrypted = 0x12;
    hQuery.EncryptedPlain =  0x20;
    hQuery.EncryptedSigned = 0x21;
    hQuery.Encrypted =       0x22;
}());

function slowEquals(A,B) {
    var equals = A.length - B.length;
    var len = Math.min(A.length, B.length);
    for (var i=0;i<len;i++) {
        equals = equals | A.charCodeAt(i)-B.charCodeAt(i);
    }
    return equals == 0;
}
