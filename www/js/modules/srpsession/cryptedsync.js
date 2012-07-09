define(['underscore',
        'backbone',
        './libsrp/sha1',
        './libsrp/bigint',
        './libsrp/crypto',],
    function(_, Backbone, SHA1, BigInt, Crypto){

    var getValue = function(object, prop) {
        if (!(object && object[prop])) return null;
        return _.isFunction(object[prop]) ? object[prop]() : object[prop];
    };

    var urlError = function() {
        throw new Error('A "url" property or function must be specified');
    };

    var methodMap = {
        'create': 'POST',
        'update': 'PUT',
        'delete': 'DELETE',
        'read': 'GET'
    };

    var slowEquals = function (A, B) {
        var equals = A.length - B.length;
        var len = Math.min(A.length, B.length);
        for (var i=0;i<len;i++) {
            equals = equals | A.charCodeAt(i)-B.charCodeAt(i);
        }
        return equals == 0;
    };

    var sign = function (msg, macKey) {
            return SHA1.hmac(new BigInt().fromUtfString(msg).toHex(), macKey);
    };

    var cryptedSync = function (key, macKey) {
        return function(method, model, options) {

            var type = methodMap[method];

            // Default options, unless specified.
            options || (options = {});

            // Default JSON-request options.
            var params = {type: type, dataType: 'json'};

            // Ensure that we have a URL.
            if (!options.url) {
              params.url = getValue(model, 'url') || urlError();
            }

            // Ensure that we have the appropriate request data.
            if (!options.data && model && (method == 'create' || method == 'update')) {
              params.contentType = 'application/json';

              var attr = model.toJSON();

              if (model.crypted) {
                  var notCrypted = _.pick(attr, _.difference(_.keys(attr), model.crypted));
                  var cryptedData = Crypto.encrypt(key, JSON.stringify( _.pick(attr, model.crypted) ) );
                  var data = _.extend({}, notCrypted, {data: cryptedData});
              } else {
                  var data = attr;
              }

              params.data = JSON.stringify( data );
            }

            // Don't process data on a non-GET request.
            //~ if (params.type !== 'GET') {
              //~ params.processData = false;
            //~ }

            // Wrap sucess callback
            var success = options.success;
            options.success = function(resp, status, xhr) {

                // Checksum
                if ( slowEquals(resp.sig, sign(resp.data, macKey)) ){
                    var response_data = JSON.parse(resp.data);

                    if ( response_data.data ){
                        var tmp = JSON.parse(Crypto.decrypt(key, response_data.data));
                        _.extend(response_data, tmp);
                        delete response_data.data;
                    } else {
                        _.each(response_data, function (e) {
                            var tmp = JSON.parse(Crypto.decrypt(key, e.data));
                            _.extend(e, tmp);
                            delete e.data;
                        });
                    }

                } else {
                    //TODO handle error
                    console.log('ERROR checksum');
                }
                //~ console.log('Sucess....');
                //~ console.log(response_data);
                if (success) success(response_data, status, xhr);
            };

            // Make the request, allowing the user to override any Ajax options.
            return $.ajax(_.extend(params, options));
        };
    };

    return cryptedSync;
});
