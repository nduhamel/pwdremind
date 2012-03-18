//
//  loginModal
//
(function( $ ) {

    var methods = {

        init : function(pwdremind) {
            $(document).bind('pwdremind/logout', $.proxy(methods.showModal, this));
            $(document).bind('pwdremind/login', $.proxy(methods.hideModal, this));

            $this = this;
            mod = $(this);
            mod.find('.alert-message.error').hide();
            mod.modal({
                    show: false,
                    backdrop: 'static',
            });

            mod.find("#login").submit(function(event){
                event.preventDefault();
                mod.find('input[type="submit"]').addClass('disabled').attr('disabled', 'disabled').val('Identification...');
                pwdremind.login({
                    JSONdata: $(this).formToJSON(),
                    onFail: $.proxy(methods.loginFail, $this),
                    });
            });

            pwdremind.islogged({
                onSuccess: $.proxy(methods.hideModal, this),
                onFail: $.proxy(methods.showModal, this)
            });

            return this;
        },

        showModal : function(){
            $(this).modal('show');
            return this;
        },

        hideModal : function(){
            mod = $(this);
            mod.find('.alert-message.error').hide();
            mod.find('input[type="submit"]').removeClass('disabled').removeAttr('disabled').val('connexion');
            mod.modal('hide');
            return this;
        },

        loginFail : function(){
            mod = $(this);
            mod.find('.alert-message.error').show();
            mod.find('input[type="submit"]').removeClass('disabled').removeAttr('disabled').val('connexion');
            return this;
        },

  };

  $.fn.loginModal = function(pwdremind) {
    return methods.init.call(this,pwdremind);
  };
})( jQuery );


//
// Keepalive timeout
//
var timeoutHandler = function(){
    if (!$.data( $('#keepalive-modal')[0], 'idletimeout')){
        console.log('Start time out');
        $.idleTimeout('#keepalive-modal', '#keepalive-modal #btn-keepalive', {
            idleAfter: 120, // user is considered idle after 2 minutes of no movement
            pollingInterval: 60, // a request to keepalive.php (below) will be sent to the server every minute
            keepAliveURL: 'sync.php?action=keepalive',
            serverResponseEquals: 'OK', // the response from keepalive.php must equal the text "OK"
            onTimeout: function(){
                console.log('timeout');
                document.pwdremind.logout();
                $('#keepalive-modal').modal('hide');
            },
            onIdle: function(){
                    $('#keepalive-modal').modal({
                        show: true,
                        backdrop: 'static',
                    });
            },
            onCountdown: function(counter){
                    // update the counter span inside the dialog during each second of the countdown
            },
            onResume: function(){
                $('#keepalive-modal').modal('hide');
            }
        });
    }else{
        $(document).trigger("idletimeout/restart");
    }
};

