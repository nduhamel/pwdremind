(function () {

    var defaultOptions = {
        letter : true,
        number : true,
        upperCase : true,
        special : true,
        pwdlength : 12,
    };

    function ramdom (){
        var iteration = 0;
        var randstr = "";
        var randomNumber;
        while(iteration < 16){
            randomNumber = (Math.floor((Math.random() * 100)) % 94) + 33;
            iteration++;
            randstr += String.fromCharCode(randomNumber);
        }
        return randstr;
    }

    function getsubstring(options){
        var result = ramdom();

        if ( !options.number ){
            result = result.replace(/[0-9]/g, '');
        }
        if ( !options.letter ){
            result = result.replace(/[a-zA-Z]/ig, '');
        }
        if ( !options.upperCase ){
            result = result.toLowerCase();
        }
        if ( !options.special ){
            result = result.replace(/[^a-zA-Z0-9]/gi, '');
        }
        return result;
    }

    function generator(options){

        var options = $.extend({}, defaultOptions, options);
        var result = getsubstring(options);

        while (result.length < options.pwdlength ){
            result += getsubstring(options);
        }
        result = result.slice(0,options.pwdlength);
        return result;
    }

    window.PasswordGenerator = generator;

})();
