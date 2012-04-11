(function() {
    function App() {
        if ( !(this instanceof arguments.callee) )
            throw Error("Constructor called as a function");
    };

    Pwdremind.App = App;

    var $document = $(document);
    var logginstate = false;
    var user_data = null;

    var defaultCategory = "Principal";

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

    // Be careful you need to update data category identifier before!
    function saveCategories (categoriesObject){
        var data = JSON.stringify(categoriesObject);
        var encrypted_data = session.encrypt(data);
        session.send({'action':'updatecat', 'data':encrypted_data}, function(response){
            if (response.status == 'OK'){
                console.log(response);
            }else{
                console.log(response);
            }
        });
    }

    App.prototype = { // public interface

    init : function (){
        $document.trigger('pwdremind/logout');
    },

    remove: function (id) {
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

    update : function (id, dataJSON) {
        $document.trigger('pwdremind/beforeUpdate');
        var data = JSON.stringify(dataJSON);
        var encrypted_data = session.encrypt(data);

        session.send({'action':'update', 'id':id, 'data':encrypted_data}, function(response){
            if (response.status == 'OK'){
                id = response.data;
                user_data = user_data.map(function(entry){
                        if (entry.id == id){
                            entry.data = data;
                        }
                        return entry;
                    });
                $document.trigger('pwdremind/afterUpdate', [id, data]);
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

    get : function (id) {
        for (i in user_data){
            if (user_data[i].id == id){
                return user_data[i];
            }
        }
        console.log('error unknown id');
    },

    login : function (options) {
        var success = function(){
            session.send({'action':'getinfo'}, function(response){

                // If empty populate with default and update it
                if ( response.data.category == '[]' ){
                    uuid = generateUUID();
                    categories = [{'name':defaultCategory,'uuid':uuid}];
                    saveCategories(categories);
                }else{
                    categories = JSON.parse(session.decrypt(response.data.category));
                }
                console.log(categories);

                $document.trigger('pwdremind/login');
            });
        };

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
