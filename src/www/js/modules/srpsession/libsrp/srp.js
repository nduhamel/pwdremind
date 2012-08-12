define(['./bigint','./sha1'], function (BigInt, SHA1) {

    Srp = {};

    function SrpOptions() {
        this.maxHexLength = this.N.toHex().length;
    }

    var Srp_256 = {
        N : new BigInt().fromHex('0115b8b692e0e045692cf280b436735c77a5a9e8a9e7ed56c965f87db5b2a2ece3'),
        g : new BigInt().fromHex('33'),
        k : new BigInt().fromHex('4b267b39118d47574683ec2d2e0e1f178a7f2262'),
        NgXorHash : new BigInt().fromHex('d93020ece43f4c4397be1a48a8c92b9b1c824152'),
        strengthBits : 256,
        hash : SHA1.sha1,
        keyHash : shaInterleave
    };

    SrpOptions.prototype = Srp_256;

    var srpOptions = new SrpOptions();
    Srp.Options = srpOptions;

    function SrpClientSession(username, password, clientNonce) {
        if ( !(this instanceof arguments.callee) )
            throw Error("Constructor called as a function");


        var username = new BigInt().fromUtfString(username);
        var password = new BigInt().fromUtfString(password);
        var clientNonce = new BigInt().fromHex(clientNonce);
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
            salt = new BigInt().fromHex(hexSalt);
            serverPublicKey = new BigInt().fromHex(hexServerPublicKey);

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
            sessionKey = new BigInt().fromHex(K);
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
            clientProof = new BigInt().fromHex(M1);
            return M1;
        };

        this.verifyServerProof = function(serverProof) {
            var hashInput = clientPublicKey.toHex(srpOptions.maxHexLength);
            hashInput += clientProof.toHex();
            hashInput += sessionKey.toHex();
            var localServerProof = srpOptions.hash(hashInput);
            return localServerProof == serverProof;
        };

        this.getMacKey = function() {
            return sessionKey.toHex().substring(32,72);
        };


    };

    Srp.createSession = function(username, password, nonce) {
        return new SrpClientSession(username, password, nonce);
    };

    function computePrivateKey(username, password, salt) {
        // charCode(':') = 0x3a;
        var innerHash = srpOptions.hash(username.toHex() + "3a" + password.toHex());
        var privateKey = srpOptions.hash(salt.toHex() + innerHash);
        return new BigInt().fromHex(privateKey);
    }

    function computeVerifier(privateKey) {
        var verifier = srpOptions.g.PowMod(privateKey, srpOptions.N);
        return verifier;
    }

    function computeVerifierFromCredentials(username, password, salt) {
        username = new BigInt().fromUtfString(username);
        password = new BigInt().fromUtfString(password);
        salt =     new BigInt().fromHex(salt);
        return computeVerifier(computePrivateKey(username, password, salt)).toHex();
    }

    Srp.computeVerifier = computeVerifierFromCredentials;

    function computeSharedRandomScrambler(A, B) {
        var hashInput = A.toHex(srpOptions.maxHexLength)+B.toHex(srpOptions.maxHexLength);
        return new BigInt().fromHex(srpOptions.hash(hashInput));
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
        var evenHash = SHA1.sha1(even);
        var oddHash  = SHA1.sha1(odd);
        var result = '';
        for ( i=0; i<evenHash.length; i+=2) {
            result += evenHash.substring(i,i+2);
            result += oddHash.substring(i,i+2);
        }
        return result;
    }

    return Srp;

});
