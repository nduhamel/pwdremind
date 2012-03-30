(function() {
    function App() {
        if ( !(this instanceof arguments.callee) )
            throw Error("Constructor called as a function");
    };

    Pwdremind.App = App;

    var $document = $(document);
    var logginstate = false;
    var user_data = null;

    var session = new Pwdremind.Session();

    function onTimeout () {
        console.log('Oups time out !! logout !!!');
        _logout();
    }

    var idletimeout = new IdleTimeout({'timeout':270, 'callback':onTimeout});

    function ping () {
        session.send({'action':'ping'},function(r){});
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
        session.send({'action':'logout'}, function(){});
        session.close();
        user_data = null;
        $document.trigger('pwdremind/logout');
    }

    function loadData (){
        session.send({'action':'get'}, function(response){
            if (response.status == 'OK'){
                user_data = [];
                for (i in response.data){
                    var entry = {};
                    entry.id = response.data[i].id;
                    entry.data = session.decrypt(response.data[i].data);
                    user_data.push(entry);
                }
                $document.trigger('pwdremind/dataLoaded', [user_data]);
            }else{
                console.log(response);
            }
        });
    }

    App.prototype = { // public interface

    init : function (){
        $document.trigger('pwdremind/logout');
    },

    remove: function () {
        $document.trigger('pwdremind/beforeRemove', [id]);
        session.send({'action':'remove', 'id':id}, function(response){
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
        var encrypted_data = session.encrypt(data);

        session.send({'action':'add', 'data':encrypted_data}, function(response){
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
        if ( user_data == null ){
            loadData();
        }else{
            $document.trigger('pwdremind/dataLoaded', [user_data]);
        }
    },

    login : function (options) {
        var success = function(){ $document.trigger('pwdremind/login'); };

        session.setup({
            authSuccess : success,
            authFailure : options.onFail,
            authUrl : 'auth.php',
            syncUrl : 'sync.php'
        });
        session.authenticate(options.JSONdata['username'], options.JSONdata['password']);
    },

    logout : _logout,


  };
}());
