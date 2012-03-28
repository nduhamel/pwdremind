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
        throw "Hermetic.Srp requires Hermetic";
    };

    if( Hermetic.Variable == undefined ){
        throw "Hermetic.Srp requires Hermetic.Variable";
    };

    if( Hermetic.Hash == undefined ){
        throw "Hermetic.Srp requires Hermetic.Hash";
    };

    if( Hermetic.Cipher == undefined ){
        throw "Hermetic.Srp requires Hermetic.Cipher";
    };

    Hermetic.Srp = {};

    function SrpOptions() {
        this.maxHexLength = this.N.toHex().length;
    }

    var Variable = Hermetic.Variable;

    var Srp_256 = {
        N : new Variable().fromHex('0115b8b692e0e045692cf280b436735c77a5a9e8a9e7ed56c965f87db5b2a2ece3'),
        g : new Variable().fromHex('33'),
        k : new Variable().fromHex('4b267b39118d47574683ec2d2e0e1f178a7f2262'),
        NgXorHash : new Variable().fromHex('d93020ece43f4c4397be1a48a8c92b9b1c824152'),
        strengthBits : 256,
        hash : Hermetic.Hash,
        keyHash : shaInterleave
    };


    /*
     var Srp_1024 = {
     N : new Variable().fromHex('eeaf0ab9adb38dd69c33f80afa8fc5e86072618775ff3c0b9ea2314c9c256576d674df7496ea81d3383b4813d692c6e0e0d5d8e250b98be48e495c1d6089dad15dc7d7b46154d6b6ce8ef4ad69b15d4982559b297bcf1885c529f566660e57ec68edbc3c05726cc02fd4cbf4976eaa9afd5138fe8376435b9fc61d2fc0eb06e3'),
     g : new Variable().fromHex('2'),
     k : new Variable().fromHex('7556aa045aef2cdd07abaf0f665c3e818913186f'),
     NgXorHash : new Variable().fromHex('ccac5083c987cb8faab63b557cefb7670ca3bcdc'),
     strengthBits : 1024,
     hash : Hermetic.SHA.sha1,
     keyHash : shaInterleave
     };*/


    SrpOptions.prototype = Srp_256;

    var srpOptions = new SrpOptions();
    Hermetic.Srp.Options = srpOptions;

    function SrpClientSession(username, password, clientNonce) {
        if ( !(this instanceof arguments.callee) )
            throw Error("Constructor called as a function");


        username = new Variable().fromUtfString(username);
        password = new Variable().fromUtfString(password);
        clientNonce = new Variable().fromHex(clientNonce);
        var salt = null;
        var serverPublicKey = null;
        var clientPublicKey = null;
        var sessionKey = null;
        var clientProof = null;

        this.computeClientPublicKey = function() {
            var g = srpOptions.g;
            var a = clientNonce;
            var N = srpOptions.N;

            var A = g.PowMod(a,N);

            clientPublicKey = A;
            return clientPublicKey.toHex(srpOptions.maxHexLength);
        };

        this.computeSessionKey = function(hexSalt, hexServerPublicKey) {
            salt = new Variable().fromHex(hexSalt);
            serverPublicKey = new Variable().fromHex(hexServerPublicKey);

            var N = srpOptions.N;
            var g = srpOptions.g;
            var k = srpOptions.k;


            var B = serverPublicKey;

            if (B.Mod(N).EqualsInt(0)) {
                throw "Server sent invalid ephemeral secret";
            }

            var scrambler = computeSharedRandomScrambler(clientPublicKey, serverPublicKey);
            var u = scrambler;

            var privateKey = computePrivateKey(username, password, salt);
            var x = privateKey;

            // v = g^x
            var v = g.PowMod(x, N);

            // S = (B + k*N - k*v) ^ (a + u*x)

            // base = (B + k*N - k*v) mod N
            var kN = k.Mult(N);
            var kv = k.Mult(v);
            var base = B;
            base =base.Add(kN);
            base = base.Sub(kv);
            base = base.Mod(N);

            // exponent = a + u*x
            var a = clientNonce;
            var ux = u.Mult(x);
            var exponent = a.Add(ux);

            // S = base ^ exponent
            var S = base.PowMod(exponent, N);
            var Shex = S.toHex(srpOptions.maxHexLength);
            var K = srpOptions.keyHash(Shex);
            sessionKey = new Variable().fromHex(K);
        };

        this.computeClientProof = function() {
            //M1 = H( H(N) xor H(g) , H (I) , s, A, B, K)
            var usernameHash = srpOptions.hash(username.toHex());

            var hashInput = srpOptions.NgXorHash.toHex();
            hashInput += usernameHash;
            hashInput += salt.toHex();
            hashInput += clientPublicKey.toHex(srpOptions.maxHexLength);
            hashInput += serverPublicKey.toHex(srpOptions.maxHexLength);
            hashInput += sessionKey.toHex();
            var M1 = srpOptions.hash(hashInput);
            clientProof = new Variable().fromHex(M1);
            return M1;
        };

        this.verifyServerProof = function(serverProof) {
            var hashInput = clientPublicKey.toHex(srpOptions.maxHexLength);
            hashInput += clientProof.toHex();
            hashInput += sessionKey.toHex();
            var localServerProof = srpOptions.hash(hashInput);
            return localServerProof == serverProof;
        };

        this.getSecureChannel = function(id) {
            // prepare prekeyed crypto functions
            var encryptKey = sessionKey.toHex().substring(0,32);
            var macKey = sessionKey.toHex().substring(32,72);

            return {
                sign : function (message) {
                    return Hermetic.Hmac(new Variable().fromUtfString(message).toHex(), macKey);
                },

                encrypt: function (message) {
                    return Hermetic.Cipher.encrypt(message, encryptKey, 128);
                },

                decrypt: function (message) {
                    return Hermetic.Cipher.decrypt(message, encryptKey, 128);
                },

                getId : function () {
                    return id;
                }
            };
        };
    };

    Hermetic.Srp.createSession = function(username, password, nonce) {
        return new SrpClientSession(username, password, nonce);
    };

    function computePrivateKey(username, password, salt) {
        // charCode(':') = 0x3a;
        var innerHash = srpOptions.hash(username.toHex() + "3a" + password.toHex());
        var privateKey = srpOptions.hash(salt.toHex() + innerHash);
        return new Variable().fromHex(privateKey);
    }

    function computeVerifier(privateKey) {
        var verifier = srpOptions.g.PowMod(privateKey, srpOptions.N);
        return verifier;
    }

    function computeVerifierFromCredentials(username, password, salt) {
        username = new Variable().fromUtfString(username);
        password = new Variable().fromUtfString(password);
        salt =     new Variable().fromHex(salt);
        return computeVerifier(computePrivateKey(username, password, salt)).toHex();
    }

    Hermetic.Srp.computeVerifier = computeVerifierFromCredentials;

    function computeSharedRandomScrambler(A, B) {
        var hashInput = A.toHex(srpOptions.maxHexLength)+B.toHex(srpOptions.maxHexLength);
        return new Variable().fromHex(srpOptions.hash(hashInput));
    }

    function shaInterleave(input) {
        //remove leading zero bytes
        while (input.length>0 && input.substring(0,2)=='00') {
            input = input.substring(2);
        }
        // make sure we have an even number of bytes (hex representation is a multiple of 4)
        if (input.length%4 != 0) {
            input = input.substring(input.length%4);
        }
        var even = '';
        var odd = '';
        for (var i=0; i<input.length; i+=4) {
            even+=input.substring(i, i+2);
            odd +=input.substring(i+2,i+4);
        }
        var evenHash = Hermetic.Hash(even);
        var oddHash  = Hermetic.Hash(odd);
        var result = '';
        for ( i=0; i<evenHash.length; i+=2) {
            result += evenHash.substring(i,i+2);
            result += oddHash.substring(i,i+2);
        }
        return result;
    }
}());