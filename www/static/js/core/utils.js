//
// string format util
//
String.format = function() {
  var s = arguments[0];
  for (var i = 0; i < arguments.length - 1; i++) {
    var reg = new RegExp("\\{" + i + "\\}", "gm");
    s = s.replace(reg, arguments[i + 1]);
  }
  return s;
};

String.prototype.strReverse = function() {
    var newstring = "";
    for (var s=0; s < this.length; s++) {
        newstring = this.charAt(s) + newstring;
    }
    return newstring;
};

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

//
//  Form to json util
//
$.fn.formToJSON = function() {
    var json = {};
    $.map($(this).serializeArray(), function(n, i){
        json[n['name']] = n['value'];
    });
    return json;
};

function IdleTimeout (options) {
    var self = this;
    self.options = options;

    $(document).bind("idle.IdleTimeout", function(){
        options.callback.call();
    });

    function start () {
        //~ console.log('IdleTimeout: start idleTimer');
        $.idleTimer(self.options.timeout * 1000);
    }

    function stop () {
        //~ console.log('IdleTimeout: stop idleTimer');
        $.idleTimer('destroy');
    }

    return {'start':start,'stop':stop};
}


function Pinger (options) {
    var self = this;
    self.options = options;
    var timer = null;

    function _ping () {
        self.options.callback.call();
        start();
    }

    function start () {
        if ( timer !== null ){
            clearTimeout(self.timer)
        }
        self.timer = setTimeout( _ping, self.options.interval * 1000);
    }

    function stop () {
        clearTimeout(self.timer)
        self.timer = null;
    }

    function restart () {
        stop();
        start();
    }

    return {'stop':stop, 'start':start, 'restart':restart};
}
