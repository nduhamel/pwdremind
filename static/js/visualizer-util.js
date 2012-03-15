
function getLoginsJSON(loginsTable) {
    var nodes = [];
    var links = [];
    var loginsTable = loginsTable // HACK here!
    var passwordsDict = {};
    for (var password in loginsTable) {
        nodes.push({
                name: password,
                group: 0
        });
        var passwordIdx = nodes.length-1;
        passwordsDict[password] = passwordIdx;
        for (var site in loginsTable[password]) {
            nodes.push({
                name: loginsTable[password][site], //.host, HACK here !
                group: 1
            });
            links.push({
                source: passwordIdx,
                target: nodes.length-1,
                value: 1
            });
        }
    }
    // Add warning edges between similar passwords
    var similarPasswordPairs = detectSimilarPasswords(loginsTable);
    for (var pairX in similarPasswordPairs) {
        var pair = similarPasswordPairs[pairX];
        nodes.push({
            name: 'These passwords are really similar!',
            group: 2
        });
        var warningNodeIdx = nodes.length-1;
        links.push({
            source: passwordsDict[pair[0]],
            target: warningNodeIdx,
            value: 2
        });
        links.push({
            source: passwordsDict[pair[1]],
            target: warningNodeIdx,
            value: 2
        });
    }
    return {
        nodes: nodes,
        links: links
    };
}

function detectSimilarPasswords(loginsTable) {
    var passwordsChecked = {};
    var similarPasswordPairs = [];

    for (var password1 in loginsTable) {
        for (var password2 in loginsTable) {
            if (password1 == password2)
                continue;
            if (passwordsChecked[password2])
                continue;

            if (passwordSimilarityCheck(password1,password2))
                similarPasswordPairs.push([password1,password2]);
        }
        passwordsChecked[password1] = true;
    }
    return similarPasswordPairs;
}


function passwordSimilarityCheck(password1,password2) {
    return levenshtein(password1,password2) < Math.max(password1.length,password2.length)/2;
}

function levenshtein(str1, str2) {
    var l1 = str1.length, l2 = str2.length;
    if (Math.min(l1, l2) === 0) {
        return Math.max(l1, l2);
    }
    var i = 0, j = 0, d = [];
    for (i = 0 ; i <= l1 ; i++) {
        d[i] = [];
        d[i][0] = i;
    }
    for (j = 0 ; j <= l2 ; j++) {
        d[0][j] = j;
    }
    for (i = 1 ; i <= l1 ; i++) {
        for (j = 1 ; j <= l2 ; j++) {
            d[i][j] = Math.min(
                d[i - 1][j] + 1,
                d[i][j - 1] + 1,
                d[i - 1][j - 1] + (str1.charAt(i - 1) === str2.charAt(j - 1) ? 0 : 1)
            );
        }
    }
    return d[l1][l2];
}



// Thanks, http://www.quirksmode.org/js/findpos.html
function findPos(obj) {
        var curleft = curtop = 0;
                if (obj.offsetParent) {
                    do {
                                curleft += obj.offsetLeft;
                                curtop += obj.offsetTop;
                        } while (obj = obj.offsetParent);
            return [curleft,curtop];
        }
}


function passwordStrength(password) {
    var securityRating = 1;
    // Over 6 characters?
    if (password.length > 6)
        securityRating += 1;
    // Over 10 characters?
    if (password.length > 10)
        securityRating += 1;
    // Mixed case?
    if (password.toLowerCase() != password)
        securityRating += 1;
    // Numeric characters?
    for (var passwordCharIdx in password) {
        if (parseFloat(password[passwordCharIdx]) != NaN) {
            securityRating += 1;
            break;
        }
    }
    return {
        score: securityRating,
        max: 5
    };
}

function gradientStringForHash(passwordHash) {
    var gradientString = "-moz-linear-gradient(left";

    for (var hashBandX = 0; hashBandX < passwordHash.length/6-1; hashBandX++)
        gradientString += ", #" + passwordHash.substr(hashBandX*6,6).toUpperCase();

    gradientString += ')';

    return gradientString;
}

function randomizeHash(passwordHash) {
    // Add a little bit of randomness to each byte
    for (var byteIdx = 0; byteIdx < passwordHash.length/2; byteIdx++) {
        var byte = parseInt(passwordHash.substr(byteIdx*2,2),16);
        // +/- 3, within 0-255
        byte = Math.min(Math.max(byte + parseInt(Math.random()*6)-3,0),255);
        var hexStr = byte.toString(16).length == 2 ? byte.toString(16) : '0' + byte.toString(16);
        passwordHash = passwordHash.substr(0,byteIdx*2) + hexStr + passwordHash.substr(byteIdx*2+2);
    }
    return passwordHash;
}

function getDataURLForHash(passwordHash,inputWidth,inputHeight) {
    var canvas = document.createElement('canvas');
    canvas.height = inputHeight;
    canvas.width = inputWidth;
    var context = canvas.getContext('2d');

    passwordHash = randomizeHash(passwordHash);

    for (var hashBandX = 0; hashBandX < 4; hashBandX++) {
        context.fillStyle='#' + passwordHash.substr(hashBandX*6,6);
        context.fillRect(hashBandX/4*inputWidth,0,inputWidth/4,inputHeight);

        context.fillStyle='#000000';
        context.fillRect(((hashBandX+1)/4*inputWidth)-1,0,2,inputHeight);
    }

    context.strokeStyle='#000000';
    context.strokeRect(0,0,inputWidth,inputHeight);

    return canvas.toDataURL();
}

/**
*
*  Secure Hash Algorithm (SHA1)
*  http://www.webtoolkit.info/
*
*
*
**/


function SHA1 (msg) {

        function rotate_left(n,s) {
                var t4 = ( n<<s ) | (n>>>(32-s));
                return t4;
        };

        function lsb_hex(val) {
                var str="";
                var i;
                var vh;
                var vl;

                for( i=0; i<=6; i+=2 ) {
                        vh = (val>>>(i*4+4))&0x0f;
                        vl = (val>>>(i*4))&0x0f;
                        str += vh.toString(16) + vl.toString(16);
                }
                return str;
        };

        function cvt_hex(val) {
                var str="";
                var i;
                var v;

                for( i=7; i>=0; i-- ) {
                        v = (val>>>(i*4))&0x0f;
                        str += v.toString(16);
                }
                return str;
        };


        function Utf8Encode(string) {
                string = string.replace(/\r\n/g,"\n");
                var utftext = "";

                for (var n = 0; n < string.length; n++) {

                        var c = string.charCodeAt(n);

                        if (c < 128) {
                                utftext += String.fromCharCode(c);
                        }
                        else if((c > 127) && (c < 2048)) {
                                utftext += String.fromCharCode((c >> 6) | 192);
                                utftext += String.fromCharCode((c & 63) | 128);
                        }
                        else {
                                utftext += String.fromCharCode((c >> 12) | 224);
                                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                                utftext += String.fromCharCode((c & 63) | 128);
                        }

                }

                return utftext;
        };

        var blockstart;
        var i, j;
        var W = new Array(80);
        var H0 = 0x67452301;
        var H1 = 0xEFCDAB89;
        var H2 = 0x98BADCFE;
        var H3 = 0x10325476;
        var H4 = 0xC3D2E1F0;
        var A, B, C, D, E;
        var temp;

        msg = Utf8Encode(msg);

        var msg_len = msg.length;

        var word_array = new Array();
        for( i=0; i<msg_len-3; i+=4 ) {
                j = msg.charCodeAt(i)<<24 | msg.charCodeAt(i+1)<<16 |
                msg.charCodeAt(i+2)<<8 | msg.charCodeAt(i+3);
                word_array.push( j );
        }

        switch( msg_len % 4 ) {
                case 0:
                        i = 0x080000000;
                break;
                case 1:
                        i = msg.charCodeAt(msg_len-1)<<24 | 0x0800000;
                break;

                case 2:
                        i = msg.charCodeAt(msg_len-2)<<24 | msg.charCodeAt(msg_len-1)<<16 | 0x08000;
                break;

                case 3:
                        i = msg.charCodeAt(msg_len-3)<<24 | msg.charCodeAt(msg_len-2)<<16 | msg.charCodeAt(msg_len-1)<<8        | 0x80;
                break;
        }

        word_array.push( i );

        while( (word_array.length % 16) != 14 ) word_array.push( 0 );

        word_array.push( msg_len>>>29 );
        word_array.push( (msg_len<<3)&0x0ffffffff );


        for ( blockstart=0; blockstart<word_array.length; blockstart+=16 ) {

                for( i=0; i<16; i++ ) W[i] = word_array[blockstart+i];
                for( i=16; i<=79; i++ ) W[i] = rotate_left(W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16], 1);

                A = H0;
                B = H1;
                C = H2;
                D = H3;
                E = H4;

                for( i= 0; i<=19; i++ ) {
                        temp = (rotate_left(A,5) + ((B&C) | (~B&D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
                        E = D;
                        D = C;
                        C = rotate_left(B,30);
                        B = A;
                        A = temp;
                }

                for( i=20; i<=39; i++ ) {
                        temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
                        E = D;
                        D = C;
                        C = rotate_left(B,30);
                        B = A;
                        A = temp;
                }

                for( i=40; i<=59; i++ ) {
                        temp = (rotate_left(A,5) + ((B&C) | (B&D) | (C&D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
                        E = D;
                        D = C;
                        C = rotate_left(B,30);
                        B = A;
                        A = temp;
                }

                for( i=60; i<=79; i++ ) {
                        temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
                        E = D;
                        D = C;
                        C = rotate_left(B,30);
                        B = A;
                        A = temp;
                }

                H0 = (H0 + A) & 0x0ffffffff;
                H1 = (H1 + B) & 0x0ffffffff;
                H2 = (H2 + C) & 0x0ffffffff;
                H3 = (H3 + D) & 0x0ffffffff;
                H4 = (H4 + E) & 0x0ffffffff;

        }

        var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);

        return temp.toLowerCase();

}
