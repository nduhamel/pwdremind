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
    if( Hermetic==undefined){
        throw "Hermetic.Prng requires Hermetic";
    };

    Hermetic.Prng = {};

    function SimplePrng() {
        if ( !(this instanceof arguments.callee) )
            throw Error("Constructor called as a function");
    };

    SimplePrng.prototype = {
        getRandomBytes : function (nBytes) {
            //TODO: implement a true secure random number generator
            var hexSize = nBytes * 2;
            var result = '';
            while (result.length<hexSize) {
                result+=Hermetic.Hash((''+Math.random()).substring(2));
            }
            return result.substring(0,hexSize);
        }
    };

    Hermetic.Prng = new SimplePrng();
}());