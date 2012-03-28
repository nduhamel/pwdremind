
var Pwdremind = (function() {

    var $document = $(document);
    var logginstate = false;
    var user_data = null;
    var secureChannel = null;
    var user_data_key = null;

    function Transport() {
        var url = 'sync.php';

        this.send = function (data, httpCallback) {
            $.get(url, data, function(responseData){
                var result = {};
                try {
                    var response = JSON.parse(responseData);

                    if ( response.data ){
                        if (slowEquals(response.sig, secureChannel.sign(response.data))) {
                            result.status = 'OK';
                            result.data = JSON.parse(response.data);
                        }else{
                            result.status = 'ERROR';
                            result.data = null;
                            result.reason = 'MESSAGE_AUTHENTICATION_FAILURE';
                        }
                    } else if ( response.msg ){
                        result.status = 'OK';
                        result.data = response.msg;
                    } else if ( response.status == 'ERROR' ){
                        result.status = 'ERROR';
                        result.data = null;
                        result.reason = response.reason;
                    } else {
                        result.status = 'ERROR';
                        result.data = null;
                        result.reason = 'MESSAGE_FORMAT_ERROR';
                    }
                } catch (e) {
                    result.status = 'ERROR';
                    result.data = null;
                    result.reason = 'MESSAGE_FORMAT_ERROR';
                }

                httpCallback(result);
            });
        }
    }

    var transport = new Transport();

    function onTimeout () {
        console.log('Oups time out !! logout !!!');
        _logout();
    }

    var idletimeout = new IdleTimeout({'timeout':270, 'callback':onTimeout});

    function ping () {
        transport.send({'action':'ping'},function(r){});
    }

    var pinger = Pinger({'interval':60*4, 'callback':ping});

    function onLogin () {
        idletimeout.start();
        pinger.start();
    }

    function onLogout () {
        pinger.stop();
        idletimeout.stop();
    }

    $(document).bind('pwdremind/login', onLogin);
    $(document).bind('pwdremind/logout', onLogout);

    function _logout () {
        transport.send({'action':'logout'}, function(){});
        user_data = null;
        secureChannel = null;
        user_data_key = null;
        if (logginstate){
            $document.trigger('pwdremind/logout');
            logginstate = !logginstate;
        }
    }

    function loadData (){
        transport.send({'action':'get'}, function(response){
            if (response.status == 'OK'){
                user_data = [];
                for (i in response.data){
                    var entry = {};
                    entry.id = response.data[i].id;
                    entry.data = sjcl.decrypt(user_data_key,response.data[i].data);
                    user_data.push(entry);
                }
                $document.trigger('pwdremind/dataLoaded', [user_data]);
            }else{
                console.log(response);
            }
        });
    }

    return { // public interface

    init : function (){
        $document.trigger('pwdremind/logout');
    },

    remove: function () {
        $document.trigger('pwdremind/beforeRemove', [id]);
        transport.send({'action':'remove', 'id':id}, function(response){
            if (response.status == 'OK'){
                user_data = user_data.filter(function(elem,i,a){ return (elem.id !=  id)});
                $document.trigger('pwdremind/afterRemove', [id]);
            }else{
                console.log(response);
            }
        });
    },

    add : function (entryJSON) {
        $document.trigger('pwdremind/beforeAdd');
        var data = JSON.stringify(entryJSON);
        var encrypted_data = sjcl.encrypt(user_data_key, data);

        transport.send({'action':'add', 'data':encrypted_data}, function(response){
            if (response.status == 'OK'){
                id = response.data;
                user_data.push({id:id, data:data});
                $document.trigger('pwdremind/afterAdd', [id, entryJSON]);
            }else{
                console.log(response);
            }
        });
    },

    getAll : function () {
        if ( user_data_key == null ){
            throw new Error("No user_data_key");
        }else if ( user_data == null ){
            loadData();
        }else{
            $document.trigger('pwdremind/dataLoaded', [user_data]);
        }
    },

    login : function (options) {
        var success = function(pwd){
            return function onlogin (channel, salt) {
                user_salt = salt;
                secureChannel = channel;
                user_data_key =  sjcl.misc.pbkdf2(pwd, salt);
                if (!logginstate){
                    $document.trigger('pwdremind/login');
                    logginstate = !logginstate;
                }
            };
        };

        hQuery.setup({authUrl: "./auth.php", authSuccess: success(options.JSONdata['password']), authFailure: options.onFail});
        hQuery.authenticate(options.JSONdata['username'], options.JSONdata['password']);
    },

    logout : _logout,


  };
})();
