// Exec on remote domain
(function(){

    init();

    var pwdremind_domain = 'http://localhost';

    function init () {
        console.log('Load Password Remind bookmarklet');
        AddListener();
        var el = document.createElement("iframe");
        el.setAttribute('id', 'pwdremind_iframe');
        el.setAttribute('style', 'display:none; height:0px;');
        document.body.appendChild(el);
        el.setAttribute('src', 'http://localhost/bookmarklet.html#'+document.URL);
    }

    function AddListener () {
        if (window.addEventListener) {  // all browsers except IE before version 9
            window.addEventListener ("message", OnMessage, false);
        }
        else if (window.attachEvent){ // IE before version 9
                window.attachEvent("onmessage", OnMessage);
        }
    }

    function OnMessage (event) {
        if(event.origin !== pwdremind_domain){
            return
        }
        console.log(event);
    }

})();
