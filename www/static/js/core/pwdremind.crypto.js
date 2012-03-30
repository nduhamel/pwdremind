(function() {

    if( sjcl == undefined ){
        throw "Pwdremind.Crypto requires sjcl";
    };

    if( Pwdremind.Crypto == undefined){
        Pwdremind.Crypto = {};
    };

    function encrypt (key, data) {
        return sjcl.encrypt(key, data);
    }

    function decrypt (key, ct) {
        return sjcl.decrypt(key, ct);
    }

    function pbkdf2 (password, salt) {
        return sjcl.misc.pbkdf2(password, salt);
    }

    function random (nBytes) {
        return sjcl.codec.hex.fromBits(sjcl.random.randomWords(nBytes/32,0));
    }

    Pwdremind.Crypto.encrypt = encrypt;
    Pwdremind.Crypto.decrypt = decrypt;
    Pwdremind.Crypto.pbkdf2 = pbkdf2;
    Pwdremind.Crypto.random = random;

}());
