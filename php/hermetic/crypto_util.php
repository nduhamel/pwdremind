<?php
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

function isHex($input) {
    for($i=0; $i<strlen($input); $i++) {
        $digit = ord($input[$i]);
        if ($digit<48) return false;
        if ($digit>102) return false;
        if ($digit<96 && $digit>57) return false;
    }
    return true;
}

function hex2dec($hex) {
    $dec = '0';
    $pow = '1';
    for ($i=strlen($hex)-1;$i>=0;$i--) {
        $digit = ord($hex[$i]);
        $digit = $digit>96?($digit ^ 96)+9:$digit ^ 48;
        $dec=bcadd($dec,bcmul($pow,$digit));
        $pow=bcmul($pow,'16');
    }
    return $dec;
}

function dec2hex($dec) {
    $digits = array('0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f');
    $hex = '';
    do {
        $digit = bcmod($dec,'16');
        $dec = bcdiv($dec,16);
        $hex = $digits[$digit].$hex;
    } while (bccomp($dec, '0'));
    return $hex;
}

function byte2hex($bytes) {
    $digits = array('0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f');
    $hex = '';
    $len = strlen($bytes);
    for ($i=0;$i<$len;$i++) {
        $b = ord($bytes[$i]) & 0xFF;
        $hex = $hex.$digits[($b & 0xF0) >> 4];
        $hex = $hex.$digits[$b & 0x0F];
    }
    return $hex;
}

function sha_interleave($input) {
    while (strlen($input)>0 && ord($input[0])==0) { //remove leading zero bytes
        $input = substr($input,1);
    }
    if ( (strlen($input) % 2) == 1) { // make sure we have an even number of bytes
        $input = substr($input,1);
    }

    $even = '';
    $odd = '';
    for ($i=0; $i<strlen($input); $i+=2) {
        $even .= $input[$i];
        $odd .= $input[$i+1];
    }

    $evenHash = sha1($even);
    $oddHash = sha1($odd);

    $hashLength = strlen($evenHash);
    $result = '';
    for ($i=0; $i<$hashLength; $i+=2) {
        $result.=substr($evenHash, $i,2).substr($oddHash, $i,2);
    }
    return $result;
}

function secure_random($bits) {
    $result = '';
    $digits = array('0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f');
    $f = fopen("/dev/urandom","r");
    $randomBytes = fread($f, $bits/8);
    fclose($f);

    $len = strlen($randomBytes);
    $b = 0;

    for ($i=0;$i<$len;$i++) {
        $b = ord($randomBytes[$i]);
        $result = $result.$digits[($b & 0xF0) >> 4];
        $result = $result.$digits[$b & 0x0F];
    }
    return $result;
}

function stringXor($a, $b) {
    $len = min(strlen($a),strlen($b));
    $result = '';
    for ($i=0; $i<$len; $i++) {
        $result = $result.( $a[$i] ^ $b[$i] );
    }
    return $result;
}

function hmac($hexKey, $message) {

    $opadSha1 = pack("H*","5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c");
    $ipadSha1 = pack("H*","36363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636");

    $sha1BlockSize = 64; //64 bytes
    $sha1OutputSize = 20; //20 bytes

    $key = pack("H*",$hexKey);
    if( strlen($key > $sha1OutputSize) ) {
    //$key = pack("H*", $this->srp->hash($key));
        $key = sha1($key,true);
    }

    $padding = pack("H*", "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
    while( strlen($key) + strlen($padding) < $sha1BlockSize ) {
        $padding.=chr(0);
    }

    $key = $key.$padding;

    $iout = "";
    $oout = "";
        
    for ($i=0; $i<strlen($ipadSha1); $i++) {
        $iout.= chr(ord($ipadSha1[$i]) ^ ord($key[$i]));
        $oout.= chr(ord($opadSha1[$i]) ^ ord($key[$i]));
    }

    //return $this->srp->hash($oout.pack("H*", $this->srp->hash($iout.$message)));
    return sha1($oout.sha1($iout.$message,true));
}

function slowEquals($A, $B) {
    $equal = strlen($A)-strlen($B);
    $len = min(strlen($A),strlen($B));

    for ($i=0; $i<$len; $i++) {
        $equal = $equal | (ord($A[$i])-ord($B[$i]));
    }

    return ($equal==0)?true:false;
}

?>