define(['./sjcl'], function () {

    Crypto = {};

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

    Crypto.encrypt = encrypt;
    Crypto.decrypt = decrypt;
    Crypto.pbkdf2 = pbkdf2;
    Crypto.random = random;

    return Crypto;

});
