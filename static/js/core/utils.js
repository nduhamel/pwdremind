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
