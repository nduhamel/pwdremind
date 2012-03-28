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

Part of this code is from the Big Integer Library v. 5.1
by Leemon Baird, http://www.leemon.com

*/
(function() {

    window.Hermetic = {};

    //bigint globals
    var bpe=0;         //bits stored per array element
    var mask=0;        //AND this with an array element to chop it down to bpe bits
    var radix=mask+1;  //equals 2^bpe.  A single 1 bit to the left of the last bit of mask.

    var digitsStr='0123456789abcdef';

    //initialize the global variables

    //bpe=number of bits in the mantissa on this platform
    bpe=0;
    while ((1<<(bpe+1)) > (1<<bpe)) {
        bpe++;
    }
    bpe>>=1;                   //bpe=number of bits in one element of the array representing the bigInt
    mask=(1<<bpe)-1;           //AND the mask with an integer to get its bpe least significant bits
    radix=mask+1;              //2^bpe.  a single 1 bit to the left of the first bit of mask

    var one=int2bigInt(1,1,1);     //constant used in powMod_()

    //the following global variables are scratchpad memory to
    //reduce dynamic memory allocation in the inner loop
    var t=new Array(0);
    var ss=t;       //used in mult_()
    var s0=t;       //used in multMod_(), squareMod_()
    var s3=t;       //used in powMod_()
    var s4=t; var s5=t; //used in mod_()
    var s6=t;       //used in bigInt2str()
    var s7=t;       //used in powMod_()
    var sa=t;       //used in mont_()

    var eg_v=t; var eg_u=t; var eg_A=t; var eg_B=t; var eg_C=t; var eg_D=t;

    ////////////////////////////////////////////////////////////////////////////////////////

    //returns how many bits long the bigInt is, not counting leading zeros.
    function bitSize(x) {
        var j,z,w;
        for (j=x.length-1; (x[j]==0) && (j>0); j--);
        for (z=0,w=x[j]; w; (w>>=1),z++);
        z+=bpe*j;
        return z;
    }

    //return a copy of x with at least n elements, adding leading zeros if needed
    function expand(x,n) {
        var ans=int2bigInt(0,(x.length>n ? x.length : n)*bpe,0);
        copy_(ans,x);
        return ans;
    }

    //return a new bigInt equal to (x mod n) for bigInts x and n.
    function mod(x,n) {
        var ans=dup(x);
        mod_(ans,n);
        return trim(ans,1);
    }

    //return (x+n) where x is a bigInt and n is an integer.
    function addInt(x,n) {
        var ans=expand(x,x.length+1);
        addInt_(ans,n);
        return trim(ans,1);
    }

    //return x*y for bigInts x and y. This is faster when y<x.
    function mult(x,y) {
        var ans=expand(x,x.length+y.length);
        mult_(ans,y);
        return trim(ans,1);
    }

    //return (x**y mod n) where x,y,n are bigInts and ** is exponentiation.  0**0=1. Faster for odd n.
    function powMod(x,y,n) {
        var ans=expand(x,n.length);
        powMod_(ans,trim(y,2),trim(n,2),0);  //this should work without the trim, but doesn't
        return trim(ans,1);
    }

    //return (x-y) for bigInts x and y.  Negative answers will be 2s complement
    function sub(x,y) {
        var ans=expand(x,(x.length>y.length ? x.length+1 : y.length+1));
        sub_(ans,y);
        return trim(ans,1);
    }

    //return (x+y) for bigInts x and y.
    function add(x,y) {
        var ans=expand(x,(x.length>y.length ? x.length+1 : y.length+1));
        add_(ans,y);
        return trim(ans,1);
    }

    //return (x**(-1) mod n) for bigInts x and n.  If no inverse exists, it returns null
    function inverseMod(x,n) {
        var ans=expand(x,n.length);
        var s;
        s=inverseMod_(ans,n);
        return s ? trim(ans,1) : null;
    }

    //return (x*y mod n) for bigInts x,y,n.  For greater speed, let y<x.
    function multMod(x,y,n) {
        var ans=expand(x,n.length);
        multMod_(ans,y,n);
        return trim(ans,1);
    }

    //do x=x**(-1) mod n, for bigInts x and n.
    //If no inverse exists, it sets x to zero and returns 0, else it returns 1.
    //The x array must be at least as large as the n array.
    function inverseMod_(x,n) {
        var k=1+2*Math.max(x.length,n.length);

        if(!(x[0]&1)  && !(n[0]&1)) {  //if both inputs are even, then inverse doesn't exist
            copyInt_(x,0);
            return 0;
        }

        if (eg_u.length!=k) {
            eg_u=new Array(k);
            eg_v=new Array(k);
            eg_A=new Array(k);
            eg_B=new Array(k);
            eg_C=new Array(k);
            eg_D=new Array(k);
        }

        copy_(eg_u,x);
        copy_(eg_v,n);
        copyInt_(eg_A,1);
        copyInt_(eg_B,0);
        copyInt_(eg_C,0);
        copyInt_(eg_D,1);
        for (;;) {
            while(!(eg_u[0]&1)) {  //while eg_u is even
                halve_(eg_u);
                if (!(eg_A[0]&1) && !(eg_B[0]&1)) { //if eg_A==eg_B==0 mod 2
                    halve_(eg_A);
                    halve_(eg_B);
                } else {
                    add_(eg_A,n);  halve_(eg_A);
                    sub_(eg_B,x);  halve_(eg_B);
                }
            }

            while (!(eg_v[0]&1)) {  //while eg_v is even
                halve_(eg_v);
                if (!(eg_C[0]&1) && !(eg_D[0]&1)) { //if eg_C==eg_D==0 mod 2
                    halve_(eg_C);
                    halve_(eg_D);
                } else {
                    add_(eg_C,n);  halve_(eg_C);
                    sub_(eg_D,x);  halve_(eg_D);
                }
            }

            if (!greater(eg_v,eg_u)) { //eg_v <= eg_u
                sub_(eg_u,eg_v);
                sub_(eg_A,eg_C);
                sub_(eg_B,eg_D);
            } else {                   //eg_v > eg_u
                sub_(eg_v,eg_u);
                sub_(eg_C,eg_A);
                sub_(eg_D,eg_B);
            }

            if (equalsInt(eg_u,0)) {
                if (negative(eg_C)) //make sure answer is nonnegative
                    add_(eg_C,n);
                copy_(x,eg_C);

                if (!equalsInt(eg_v,1)) { //if GCD_(x,n)!=1, then there is no inverse
                    copyInt_(x,0);
                    return 0;
                }
                return 1;
            }
        }
    }

    //return x**(-1) mod n, for integers x and n.  Return 0 if there is no inverse
    function inverseModInt(x,n) {
        var a=1,b=0,t;
        for (;;) {
            if (x==1) return a;
            if (x==0) return 0;
            b-=a*Math.floor(n/x);
            n%=x;

            if (n==1) return b; //to avoid negatives, change this b to n-b, and each -= to +=
            if (n==0) return 0;
            a-=b*Math.floor(x/n);
            x%=n;
        }
    }

    //is bigInt x negative?
    function negative(x) {
        return ((x[x.length-1]>>(bpe-1))&1);
    }


    //is (x << (shift*bpe)) > y?
    //x and y are nonnegative bigInts
    //shift is a nonnegative integer
    function greaterShift(x,y,shift) {
        var kx=x.length, ky=y.length;
        k=((kx+shift)<ky) ? (kx+shift) : ky;
        for (i=ky-1-shift; i<kx && i>=0; i++)
            if (x[i]>0)
                return 1; //if there are nonzeros in x to the left of the first column of y, then x is bigger
        for (i=kx-1+shift; i<ky; i++)
            if (y[i]>0)
                return 0; //if there are nonzeros in y to the left of the first column of x, then x is not bigger
        for (i=k-1; i>=shift; i--)
            if      (x[i-shift]>y[i]) return 1;
            else if (x[i-shift]<y[i]) return 0;
        return 0;
    }

    //is x > y? (x and y both nonnegative)
    function greater(x,y) {
        var i;
        var k=(x.length<y.length) ? x.length : y.length;

        for (i=x.length;i<y.length;i++)
            if (y[i])
                return 0;  //y has more digits

        for (i=y.length;i<x.length;i++)
            if (x[i])
                return 1;  //x has more digits

        for (i=k-1;i>=0;i--)
            if (x[i]>y[i])
                return 1;
            else if (x[i]<y[i])
                return 0;
        return 0;
    }

    //divide x by y giving quotient q and remainder r.  (q=floor(x/y),  r=x mod y).  All 4 are bigints.
    //x must have at least one leading zero element.
    //y must be nonzero.
    //q and r must be arrays that are exactly the same length as x. (Or q can have more).
    //Must have x.length >= y.length >= 2.
    function divide_(x,y,q,r) {
        var kx, ky;
        var i,j,y1,y2,c,a,b;
        copy_(r,x);
        for (ky=y.length;y[ky-1]==0;ky--); //ky is number of elements in y, not including leading zeros

        //normalize: ensure the most significant element of y has its highest bit set
        b=y[ky-1];
        for (a=0; b; a++)
            b>>=1;
        a=bpe-a;  //a is how many bits to shift so that the high order bit of y is leftmost in its array element
        leftShift_(y,a);  //multiply both by 1<<a now, then divide both by that at the end
        leftShift_(r,a);

        //Rob Visser discovered a bug: the following line was originally just before the normalization.
        for (kx=r.length;r[kx-1]==0 && kx>ky;kx--); //kx is number of elements in normalized x, not including leading zeros

        copyInt_(q,0);                      // q=0
        while (!greaterShift(y,r,kx-ky)) {  // while (leftShift_(y,kx-ky) <= r) {
            subShift_(r,y,kx-ky);             //   r=r-leftShift_(y,kx-ky)
            q[kx-ky]++;                       //   q[kx-ky]++;
        }                                   // }

        for (i=kx-1; i>=ky; i--) {
            if (r[i]==y[ky-1])
                q[i-ky]=mask;
            else
                q[i-ky]=Math.floor((r[i]*radix+r[i-1])/y[ky-1]);

            //The following for(;;) loop is equivalent to the commented while loop,
            //except that the uncommented version avoids overflow.
            //The commented loop comes from HAC, which assumes r[-1]==y[-1]==0
            //  while (q[i-ky]*(y[ky-1]*radix+y[ky-2]) > r[i]*radix*radix+r[i-1]*radix+r[i-2])
            //    q[i-ky]--;
            for (;;) {
                y2=(ky>1 ? y[ky-2] : 0)*q[i-ky];
                c=y2>>bpe;
                y2=y2 & mask;
                y1=c+q[i-ky]*y[ky-1];
                c=y1>>bpe;
                y1=y1 & mask;

                if (c==r[i] ? y1==r[i-1] ? y2>(i>1 ? r[i-2] : 0) : y1>r[i-1] : c>r[i])
                    q[i-ky]--;
                else
                    break;
            }

            linCombShift_(r,y,-q[i-ky],i-ky);    //r=r-q[i-ky]*leftShift_(y,i-ky)
            if (negative(r)) {
                addShift_(r,y,i-ky);         //r=r+leftShift_(y,i-ky)
                q[i-ky]--;
            }
        }

        rightShift_(y,a);  //undo the normalization step
        rightShift_(r,a);  //undo the normalization step
    }

    //do carries and borrows so each element of the bigInt x fits in bpe bits.
    function carry_(x) {
        var i,k,c,b;
        k=x.length;
        c=0;
        for (i=0;i<k;i++) {
            c+=x[i];
            b=0;
            if (c<0) {
                b=-(c>>bpe);
                c+=b*radix;
            }
            x[i]=c & mask;
            c=(c>>bpe)-b;
        }
    }

    //return x mod n for bigInt x and integer n.
    function modInt(x,n) {
        var i,c=0;
        for (i=x.length-1; i>=0; i--)
            c=(c*radix+x[i])%n;
        return c;
    }

    //convert the integer t into a bigInt with at least the given number of bits.
    //the returned array stores the bigInt in bpe-bit chunks, little endian (buff[0] is least significant word)
    //Pad the array with leading zeros so that it has at least minSize elements.
    //There will always be at least one leading 0 element.
    function int2bigInt(t,bits,minSize) {
        var i,k;
        k=Math.ceil(bits/bpe)+1;
        k=minSize>k ? minSize : k;
        buff=new Array(k);
        copyInt_(buff,t);
        return buff;
    }

    //return the bigInt given a string representation in a given base.
    //Pad the array with leading zeros so that it has at least minSize elements.
    //If base=-1, then it reads in a space-separated list of array elements in decimal.
    //The array will always have at least one leading zero, unless base=-1.
    function str2bigInt(s,base,minSize) {
        var d, i, j, x, y, kk;
        var k=s.length;
        if (base==-1) { //comma-separated list of array elements in decimal
            x=new Array(0);
            for (;;) {
                y=new Array(x.length+1);
                for (i=0;i<x.length;i++)
                    y[i+1]=x[i];
                y[0]=parseInt(s,10);
                x=y;
                d=s.indexOf(',',0);
                if (d<1)
                    break;
                s=s.substring(d+1);
                if (s.length==0)
                    break;
            }
            if (x.length<minSize) {
                y=new Array(minSize);
                copy_(y,x);
                return y;
            }
            return x;
        }

        x=int2bigInt(0,base*k,0);
        for (i=0;i<k;i++) {
            d=digitsStr.indexOf(s.substring(i,i+1),0);
            if (base<=36 && d>=36)  //convert lowercase to uppercase if base<=36
                d-=26;
            if (d<base && d>=0) {   //ignore illegal characters
                multInt_(x,base);
                addInt_(x,d);
            }
        }

        for (k=x.length;k>0 && !x[k-1];k--); //strip off leading zeros
        k=minSize>k+1 ? minSize : k+1;
        y=new Array(k);
        kk=k<x.length ? k : x.length;
        for (i=0;i<kk;i++)
            y[i]=x[i];
        for (;i<k;i++)
            y[i]=0;
        return y;
    }

    //is bigint x equal to integer y?
    //y must have less than bpe bits
    function equalsInt(x,y) {
        var i;
        if (x[0]!=y)
            return 0;
        for (i=1;i<x.length;i++)
            if (x[i])
                return 0;
        return 1;
    }

    //are bigints x and y equal?
    //this works even if x and y are different lengths and have arbitrarily many leading zeros
    function equals(x,y) {
        var i;
        var k=x.length<y.length ? x.length : y.length;
        for (i=0;i<k;i++)
            if (x[i]!=y[i])
                return 0;
        if (x.length>y.length) {
            for (;i<x.length;i++)
                if (x[i])
                    return 0;
        } else {
            for (;i<y.length;i++)
                if (y[i])
                    return 0;
        }
        return 1;
    }

    //is the bigInt x equal to zero?
    function isZero(x) {
        var i;
        for (i=0;i<x.length;i++)
            if (x[i])
                return 0;
        return 1;
    }

    //convert a bigInt into a string in a given base, from base 2 up to base 95.
    //Base -1 prints the contents of the array representing the number.
    function bigInt2str(x,base) {
        var i,t,s="";

        if (s6.length!=x.length)
            s6=dup(x);
        else
            copy_(s6,x);

        if (base==-1) { //return the list of array contents
            for (i=x.length-1;i>0;i--)
                s+=x[i]+',';
            s+=x[0];
        }
        else { //return it in the given base
            while (!isZero(s6)) {
                t=divInt_(s6,base);  //t=s6 % base; s6=floor(s6/base);
                s=digitsStr.substring(t,t+1)+s;
            }
        }
        if (s.length==0)
            s="0";
        return s;
    }

    //returns a duplicate of bigInt x
    function dup(x) {
        var i;
        buff=new Array(x.length);
        copy_(buff,x);
        return buff;
    }

    //do x=y on bigInts x and y.  x must be an array at least as big as y (not counting the leading zeros in y).
    function copy_(x,y) {
        var i;
        var k=x.length<y.length ? x.length : y.length;
        for (i=0;i<k;i++)
            x[i]=y[i];
        for (i=k;i<x.length;i++)
            x[i]=0;
    }

    //do x=y on bigInt x and integer y.
    function copyInt_(x,n) {
        var i,c;
        for (c=n,i=0;i<x.length;i++) {
            x[i]=c & mask;
            c>>=bpe;
        }
    }

    //do x=x+n where x is a bigInt and n is an integer.
    //x must be large enough to hold the result.
    function addInt_(x,n) {
        var i,k,c,b;
        x[0]+=n;
        k=x.length;
        c=0;
        for (i=0;i<k;i++) {
            c+=x[i];
            b=0;
            if (c<0) {
                b=-(c>>bpe);
                c+=b*radix;
            }
            x[i]=c & mask;
            c=(c>>bpe)-b;
            if (!c) return; //stop carrying as soon as the carry_ is zero
        }
    }

    //right shift bigInt x by n bits.  0 <= n < bpe.
    function rightShift_(x,n) {
        var i;
        var k=Math.floor(n/bpe);
        if (k) {
            for (i=0;i<x.length-k;i++) //right shift x by k elements
                x[i]=x[i+k];
            for (;i<x.length;i++)
                x[i]=0;
            n%=bpe;
        }
        for (i=0;i<x.length-1;i++) {
            x[i]=mask & ((x[i+1]<<(bpe-n)) | (x[i]>>n));
        }
        x[i]>>=n;
    }

    //do x=floor(|x|/2)*sgn(x) for bigInt x in 2's complement
    function halve_(x) {
        var i;
        for (i=0;i<x.length-1;i++) {
            x[i]=mask & ((x[i+1]<<(bpe-1)) | (x[i]>>1));
        }
        x[i]=(x[i]>>1) | (x[i] & (radix>>1));  //most significant bit stays the same
    }

    //left shift bigInt x by n bits.
    function leftShift_(x,n) {
        var i;
        var k=Math.floor(n/bpe);
        if (k) {
            for (i=x.length; i>=k; i--) //left shift x by k elements
                x[i]=x[i-k];
            for (;i>=0;i--)
                x[i]=0;
            n%=bpe;
        }
        if (!n)
            return;
        for (i=x.length-1;i>0;i--) {
            x[i]=mask & ((x[i]<<n) | (x[i-1]>>(bpe-n)));
        }
        x[i]=mask & (x[i]<<n);
    }

    //do x=x*n where x is a bigInt and n is an integer.
    //x must be large enough to hold the result.
    function multInt_(x,n) {
        var i,k,c,b;
        if (!n)
            return;
        k=x.length;
        c=0;
        for (i=0;i<k;i++) {
            c+=x[i]*n;
            b=0;
            if (c<0) {
                b=-(c>>bpe);
                c+=b*radix;
            }
            x[i]=c & mask;
            c=(c>>bpe)-b;
        }
    }

    //do x=floor(x/n) for bigInt x and integer n, and return the remainder
    function divInt_(x,n) {
        var i,r=0,s;
        for (i=x.length-1;i>=0;i--) {
            s=r*radix+x[i];
            x[i]=Math.floor(s/n);
            r=s%n;
        }
        return r;
    }

    //do the linear combination x=a*x+b*y for bigInts x and y, and integers a and b.
    //x must be large enough to hold the answer.
    function linComb_(x,y,a,b) {
        var i,c,k,kk;
        k=x.length<y.length ? x.length : y.length;
        kk=x.length;
        for (c=0,i=0;i<k;i++) {
            c+=a*x[i]+b*y[i];
            x[i]=c & mask;
            c>>=bpe;
        }
        for (i=k;i<kk;i++) {
            c+=a*x[i];
            x[i]=c & mask;
            c>>=bpe;
        }
    }

    //do the linear combination x=a*x+b*(y<<(ys*bpe)) for bigInts x and y, and integers a, b and ys.
    //x must be large enough to hold the answer.
    function linCombShift_(x,y,b,ys) {
        var i,c,k,kk;
        k=x.length<ys+y.length ? x.length : ys+y.length;
        kk=x.length;
        for (c=0,i=ys;i<k;i++) {
            c+=x[i]+b*y[i-ys];
            x[i]=c & mask;
            c>>=bpe;
        }
        for (i=k;c && i<kk;i++) {
            c+=x[i];
            x[i]=c & mask;
            c>>=bpe;
        }
    }

    //do x=x+(y<<(ys*bpe)) for bigInts x and y, and integers a,b and ys.
    //x must be large enough to hold the answer.
    function addShift_(x,y,ys) {
        var i,c,k,kk;
        k=x.length<ys+y.length ? x.length : ys+y.length;
        kk=x.length;
        for (c=0,i=ys;i<k;i++) {
            c+=x[i]+y[i-ys];
            x[i]=c & mask;
            c>>=bpe;
        }
        for (i=k;c && i<kk;i++) {
            c+=x[i];
            x[i]=c & mask;
            c>>=bpe;
        }
    }

    //do x=x-(y<<(ys*bpe)) for bigInts x and y, and integers a,b and ys.
    //x must be large enough to hold the answer.
    function subShift_(x,y,ys) {
        var i,c,k,kk;
        k=x.length<ys+y.length ? x.length : ys+y.length;
        kk=x.length;
        for (c=0,i=ys;i<k;i++) {
            c+=x[i]-y[i-ys];
            x[i]=c & mask;
            c>>=bpe;
        }
        for (i=k;c && i<kk;i++) {
            c+=x[i];
            x[i]=c & mask;
            c>>=bpe;
        }
    }

    //do x=x-y for bigInts x and y.
    //x must be large enough to hold the answer.
    //negative answers will be 2s complement
    function sub_(x,y) {
        var i,c,k,kk;
        k=x.length<y.length ? x.length : y.length;
        for (c=0,i=0;i<k;i++) {
            c+=x[i]-y[i];
            x[i]=c & mask;
            c>>=bpe;
        }
        for (i=k;c && i<x.length;i++) {
            c+=x[i];
            x[i]=c & mask;
            c>>=bpe;
        }
    }

    //do x=x+y for bigInts x and y.
    //x must be large enough to hold the answer.
    function add_(x,y) {
        var i,c,k,kk;
        k=x.length<y.length ? x.length : y.length;
        for (c=0,i=0;i<k;i++) {
            c+=x[i]+y[i];
            x[i]=c & mask;
            c>>=bpe;
        }
        for (i=k;c && i<x.length;i++) {
            c+=x[i];
            x[i]=c & mask;
            c>>=bpe;
        }
    }

    //do x=x*y for bigInts x and y.  This is faster when y<x.
    function mult_(x,y) {
        var i;
        if (ss.length!=2*x.length)
            ss=new Array(2*x.length);
        copyInt_(ss,0);
        for (i=0;i<y.length;i++)
            if (y[i])
                linCombShift_(ss,x,y[i],i);   //ss=1*ss+y[i]*(x<<(i*bpe))
        copy_(x,ss);
    }

    //do x=x mod n for bigInts x and n.
    function mod_(x,n) {
        if (s4.length!=x.length)
            s4=dup(x);
        else
            copy_(s4,x);
        if (s5.length!=x.length)
            s5=dup(x);
        divide_(s4,n,s5,x);  //x = remainder of s4 / n
    }

    //do x=x*y mod n for bigInts x,y,n.
    //for greater speed, let y<x.
    function multMod_(x,y,n) {
        var i;
        if (s0.length!=2*x.length)
            s0=new Array(2*x.length);
        copyInt_(s0,0);
        for (i=0;i<y.length;i++)
            if (y[i])
                linCombShift_(s0,x,y[i],i);   //s0=1*s0+y[i]*(x<<(i*bpe))
        mod_(s0,n);
        copy_(x,s0);
    }

    //do x=x*x mod n for bigInts x,n.
    function squareMod_(x,n) {
        var i,j,d,c,kx,kn,k;
        for (kx=x.length; kx>0 && !x[kx-1]; kx--);  //ignore leading zeros in x
        k=kx>n.length ? 2*kx : 2*n.length; //k=# elements in the product, which is twice the elements in the larger of x and n
        if (s0.length!=k)
            s0=new Array(k);
        copyInt_(s0,0);
        for (i=0;i<kx;i++) {
            c=s0[2*i]+x[i]*x[i];
            s0[2*i]=c & mask;
            c>>=bpe;
            for (j=i+1;j<kx;j++) {
                c=s0[i+j]+2*x[i]*x[j]+c;
                s0[i+j]=(c & mask);
                c>>=bpe;
            }
            s0[i+kx]=c;
        }
        mod_(s0,n);
        copy_(x,s0);
    }

    //return x with exactly k leading zero elements
    function trim(x,k) {
        var i,y;
        for (i=x.length; i>0 && !x[i-1]; i--);
        y=new Array(i+k);
        copy_(y,x);
        return y;
    }

    //do x=x**y mod n, where x,y,n are bigInts and ** is exponentiation.  0**0=1.
    //this is faster when n is odd.  x usually needs to have as many elements as n.
    function powMod_(x,y,n) {
        var k1,k2,kn,np;
        if(s7.length!=n.length)
            s7=dup(n);

        //for even modulus, use a simple square-and-multiply algorithm,
        //rather than using the more complex Montgomery algorithm.
        if ((n[0]&1)==0) {
            copy_(s7,x);
            copyInt_(x,1);
            while(!equalsInt(y,0)) {
                if (y[0]&1)
                    multMod_(x,s7,n);
                divInt_(y,2);
                squareMod_(s7,n);
            }
            return;
        }

        //calculate np from n for the Montgomery multiplications
        copyInt_(s7,0);
        for (kn=n.length;kn>0 && !n[kn-1];kn--);
        np=radix-inverseModInt(modInt(n,radix),radix);
        s7[kn]=1;
        multMod_(x ,s7,n);   // x = x * 2**(kn*bp) mod n

        if (s3.length!=x.length)
            s3=dup(x);
        else
            copy_(s3,x);

        for (k1=y.length-1;k1>0 & !y[k1]; k1--);  //k1=first nonzero element of y
        if (y[k1]==0) {  //anything to the 0th power is 1
            copyInt_(x,1);
            return;
        }
        for (k2=1<<(bpe-1);k2 && !(y[k1] & k2); k2>>=1);  //k2=position of first 1 bit in y[k1]
        for (;;) {
            if (!(k2>>=1)) {  //look at next bit of y
                k1--;
                if (k1<0) {
                    mont_(x,one,n,np);
                    return;
                }
                k2=1<<(bpe-1);
            }
            mont_(x,x,n,np);

            if (k2 & y[k1]) //if next bit is a 1
                mont_(x,s3,n,np);
        }
    }

    //do x=x*y*Ri mod n for bigInts x,y,n,
    //  where Ri = 2**(-kn*bpe) mod n, and kn is the
    //  number of elements in the n array, not
    //  counting leading zeros.
    //x must be large enough to hold the answer.
    //It's OK if x and y are the same variable.
    //must have:
    //  x,y < n
    //  n is odd
    //  np = -(n^(-1)) mod radix
    function mont_(x,y,n,np) {
        var i,j,c,ui,t;
        var kn=n.length;
        var ky=y.length;

        if (sa.length!=kn)
            sa=new Array(kn);

        for (;kn>0 && n[kn-1]==0;kn--); //ignore leading zeros of n
        //this function sometimes gives wrong answers when the next line is uncommented
        //for (;ky>0 && y[ky-1]==0;ky--); //ignore leading zeros of y

        copyInt_(sa,0);

        //the following loop consumes 95% of the runtime for randTruePrime_() and powMod_() for large keys
        for (i=0; i<kn; i++) {
            t=sa[0]+x[i]*y[0];
            ui=((t & mask) * np) & mask;  //the inner "& mask" is needed on Macintosh MSIE, but not windows MSIE
            c=(t+ui*n[0]) >> bpe;
            t=x[i];

            //do sa=(sa+x[i]*y+ui*n)/b   where b=2**bpe
            for (j=1;j<ky;j++) {
                c+=sa[j]+t*y[j]+ui*n[j];
                sa[j-1]=c & mask;
                c>>=bpe;
            }
            for (;j<kn;j++) {
                c+=sa[j]+ui*n[j];
                sa[j-1]=c & mask;
                c>>=bpe;
            }
            sa[j-1]=c & mask;
        }

        if (!greater(n,sa))
            sub_(sa,n);
        copy_(x,sa);
    }

    function zeropadleft(input, length) {
        length -= input.length;
        for (var i=0;i<length;i++) {
            input = '0'+input;
        }
        return input;
    }

    var hexdigits = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];

    function Variable() {
        if ( !(this instanceof arguments.callee) )
            throw Error("Constructor called as a function");
    };

    Hermetic.Variable = Variable;

    Variable.prototype = {

        reset : function() {
            this.hexValue = undefined;
            this.bigIntValue = undefined;
        },

        fromUtfString : function(utfStr) {
            this.reset();
            //kluge, delegates utf8 encoding to the browser
            var tmp = encodeURIComponent(utfStr);
            var result = '';
            var i = 0;
            while (i<tmp.length) {
                if (tmp.substring(i,i+1)=="%") {
                    result += tmp.substring(i+1,i+3);
                    i+=3;
                } else {
                    var c = tmp.charCodeAt(i);
                    var cHi = (c & 0xF0) >> 4;
                    var cLo = c & 0x0F;
                    result += hexdigits[cHi];
                    result += hexdigits[cLo];
                    i+=1;
                }
            }
            this.hexValue = result;
            return this;
        },

        fromHex : function(hexValue) {
            this.reset();
            this.hexValue = hexValue;
            return this;
        },

        fromBigInt : function(bigIntValue) {
            this.reset();
            this.bigIntValue = bigIntValue;
            return this;
        },

        toHex : function(minLength) {

            if (this.hexValue == undefined) {
                if (this.bigIntValue == undefined) {
                    throw "undefined variable";
                }
                this.hexValue = bigInt2str(this.bigIntValue,16);
            }

            if (arguments.length==1) {
                return zeropadleft(this.hexValue, minLength);
            }

            //prepend 0, this means we can always convert this value to bytes
            if (this.hexValue.length % 2 != 0 ) {
                this.hexValue = '0'+this.hexValue;
            }

            return this.hexValue;
        },

        toBigInt : function() {            
            if (this.bigIntValue == undefined) {
                if (this.hexValue == undefined) {
                    throw "undefined variable";
                }
                this.bigIntValue = str2bigInt(this.hexValue,16,1);
            }
            return this.bigIntValue;
        },

        Mod : function(n) {
            return new Variable().fromBigInt(mod(this.toBigInt(),n.toBigInt()));
        },

        Add : function(n) {
            return new Variable().fromBigInt(add(this.toBigInt(),n.toBigInt()));
        },

        Sub : function(n) {
            return new Variable().fromBigInt(sub(this.toBigInt(),n.toBigInt()));
        },

        Mult : function(n) {
            return new Variable().fromBigInt(mult(this.toBigInt(),n.toBigInt()));
        },

        MultMod : function(x,n) {
            return new Variable().fromBigInt(multMod(this.toBigInt(),x.toBigInt(),n.toBigInt()));
        },

        PowMod : function(x,n) {
            return new Variable().fromBigInt(powMod(this.toBigInt(), x.toBigInt(), n.toBigInt()));
        },

        Equals : function(n) {
            return equals(this.toBigInt(),n.toBigInt());
        },

        EqualsInt : function(i) {
            return equalsInt(this.toBigInt(),i);
        }
        
    };
}());    