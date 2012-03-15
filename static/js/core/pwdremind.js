
function Pwdremind(document){

    var $document = $(document);
    var logginstate = false;
    var user_data = null;

    $document.trigger('pwdremind/logout');

    this.remove = function(id){
        $document.trigger('pwdremind/beforeRemove', [id]);
        $.get('sync.php',{'action':'remove', 'id':id},function(data){
            user_data = user_data.filter(function(elem,i,a){ return (elem.id !=  id)});
            $document.trigger('pwdremind/afterRemove', [id]);
        });
    }

    this.add = function(entryJSON){
        $document.trigger('pwdremind/beforeAdd');
        $.get('sync.php',{'action':'add', 'data':JSON.stringify(entryJSON)},function(data){
            id = JSON.parse(data)['id'];
            user_data.push({id:id, data:JSON.stringify(entryJSON)});
            $document.trigger('pwdremind/afterAdd', [id, entryJSON]);
        });
    }

    this.getAll = function(){
        if ( user_data == null ){
            $.get('sync.php',{'action':'get'}, $.proxy(_loadData, this));
        }else{
            $document.trigger('pwdremind/dataLoaded', [user_data]);
        }
    }

    this.islogged = function(options){
        $.get('sync.php?action=isloggedin', function(data) {
            if (data){
                if (!logginstate){
                    $document.trigger('pwdremind/login');
                    logginstate = !logginstate;
                    user_data = null;
                }
                (options.onSuccess)? options.onSuccess.call() : $.noop.call();
            }else{
                if (logginstate){
                    $document.trigger('pwdremind/logout');
                    logginstate = !logginstate;
                }
                (options.onFail)? options.onFail.call() : $.noop.call();
            }
        }).fail(function(jqXHR, textStatus) {
            alert( "Request failed: " + textStatus );
        });
    }

    this.login = function(options){
        $.post('sync.php', options.JSONdata, $.proxy(this._onlogin(options.onFail), this));
    }

    this._onlogin = function (onFail){
        return function (data){
            data = JSON.parse(data);
            if (data.error) {
                if (onFail){
                    onFail.call();
                }
            }else{
                if (!logginstate){
                    //~ console.log('trigger: pwdremind/login');
                    $document.trigger('pwdremind/login');
                    logginstate = !logginstate;
                }
            }
        };
    }

    var _loadData = function(data){
        data = JSON.parse(data);
        if (data['error']){
            $document.trigger('pwdremind/logout');
            user_data = null;
        }else{
            user_data = data;
            $document.trigger('pwdremind/dataLoaded', [user_data]);
        }
    }

    this.logout = function(){
        $.get('sync.php?action=logout', function(data) {
            if (logginstate){
                $document.trigger('pwdremind/logout');
                logginstate = !logginstate;
                user_data = null;
            }
        });
    }

}
