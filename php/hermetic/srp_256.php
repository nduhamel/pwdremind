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

interface SrpOptions {
    public function Nhex();
    public function Ndec();
    public function ghex();
    public function gdec();
    public function khex();
    public function kdec();
    public function NgXorHash();
    public function privateKeyBitSize();
    public function hash($input);
    public function keyHash($input);
}

class SRP_SHA1_256 implements SRPOptions {

    public function Nhex() { return '0115b8b692e0e045692cf280b436735c77a5a9e8a9e7ed56c965f87db5b2a2ece3'; }
    public function Ndec() { return '125617018995153554710546479714086468244499594888726646874671447258204721048803'; }
    public function ghex() { return '33'; }
    public function gdec() { return '51'; }
    public function khex() { return '4b267b39118d47574683ec2d2e0e1f178a7f2262'; }
    public function kdec() { return '429032470359927085751846514107561340627840868962'; }
    public function NgXorHash() { return "\xd9\x30\x20\xec\xe4\x3f\x4c\x43\x97\xbe\x1a\x48\xa8\xc9\x2b\x9b\x1c\x82\x41\x52"; }
    public function privateKeyBitSize() {return 256;}
    public function hash($input) {
        return sha1($input);
    }
    public function keyHash($input) {
        return sha_interleave($input);
    }
}

?>