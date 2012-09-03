define([], function () {

    SHA1 = {};

    /************************************************
     *     SHA1 and HMAC
     ************************************************/
    var hex_chr = "0123456789abcdef";
    function hex(num)
    {
        var str = "";
        for(var j = 7; j >= 0; j--)
            str += hex_chr.charAt((num >> (j * 4)) & 0x0F);
        return str;
    }

    /*
     * Input is in hex format - trailing odd nibble gets a zero appended.
     */
    function hex2blks_SHA1(hex)
    {
        var len = (hex.length + 1) >> 1;
        var nblk = ((len + 8) >> 6) + 1;
        var blks = new Array(nblk * 16);
        for(var i = 0; i < nblk * 16; i++) blks[i] = 0;
        for(i = 0; i < len; i++)
            blks[i >> 2] |= parseInt(hex.substr(2*i, 2), 16) << (24 - (i % 4) * 8);
        blks[i >> 2] |= 0x80 << (24 - (i % 4) * 8);
        blks[nblk * 16 - 1] = len * 8;
        return blks;
    }

    /*
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     * to work around bugs in some JS interpreters.
     */
    function add32bit(x, y)
    {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    /*
     * Bitwise rotate a 32-bit number to the left
     */
    function rol(num, cnt)
    {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    /*
     * Perform the appropriate triplet combination function for the current
     * iteration
     */
    function ft(t, b, c, d)
    {
        if(t < 20) return (b & c) | ((~b) & d);
        if(t < 40) return b ^ c ^ d;
        if(t < 60) return (b & c) | (b & d) | (c & d);
        return b ^ c ^ d;
    }

    /*
     * Determine the appropriate additive constant for the current iteration
     */
    function kt(t)
    {
        return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
                                        (t < 60) ? -1894007588 : -899497514;
    }

    function calcSHA1Hex(str)
    {
        return calcSHA1Blks(hex2blks_SHA1(str));
    }

    function calcSHA1Blks(x)
    {
        var s = calcSHA1Raw(x);
        return hex(s[0]) + hex(s[1]) + hex(s[2]) + hex(s[3]) + hex(s[4]);
    }

    function calcSHA1Raw(x)
    {
        var w = new Array(80);

        var a =  1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d =  271733878;
        var e = -1009589776;

        for(var i = 0; i < x.length; i += 16)
        {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;
            var olde = e;

            for(var j = 0; j < 80; j++)
            {
                var t;
                if(j < 16) w[j] = x[i + j];
                else w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
                t = add32bit(add32bit(rol(a, 5), ft(j, b, c, d)), add32bit(add32bit(e, w[j]), kt(j)));
                e = d;
                d = c;
                c = rol(b, 30);
                b = a;
                a = t;
            }

            a = add32bit(a, olda);
            b = add32bit(b, oldb);
            c = add32bit(c, oldc);
            d = add32bit(d, oldd);
            e = add32bit(e, olde);
        }
        return new Array(a, b, c, d, e);
    }


    var hexXorTable = (function(){
        var table = {};
        var h=['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
        for (var a = 0; a<16; a++) {
            for (var b = 0; b<16; b++) {
                var c = a ^ b;
                table[h[a]+h[b]]=h[c];
            }
        }
        return table;
    })();

    function hexxor(a,b) {
        a = a.toLowerCase();
        b = b.toLowerCase();

        var n = Math.min(a.length,b.length);
        var output = new Array();

        for (var i=0;i<n;i++) {
            output[i] = hexXorTable[a.charAt(i)+b.charAt(i)];
        }
        return output.join("");
    }

    var opadSha1 = "5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c";
    var ipadSha1 = "36363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636";
    var sha1BlockSize = 128; //64 bytes
    var sha1OutputSize = 40; //20 bytes

    function HMAC_SHA1(message, key) {
        if (key.length > sha1OutputSize) {
            key = calcSHA1Hex(key); //make sure key is the same size as hash output
        }

        var padding = ["0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"];

        var padLength = padding[0].length;
        while((key.length+padLength)<sha1BlockSize) {
            padding.push("00");
            padLength +=2;
        }
        key = key + padding.join("");

        var iout = hexxor(ipadSha1,key);;
        var oout = hexxor(opadSha1,key);

        return calcSHA1Hex(oout+calcSHA1Hex(iout+message));
    }

    SHA1.hmac = HMAC_SHA1;
    SHA1.sha1 = calcSHA1Hex;
    return SHA1;

});

