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

            mod.find("#login-form").submit(function(event){
                event.preventDefault();
                mod.find('input[type="submit"]').addClass('disabled').attr('disabled', 'disabled').val('Identification...');
                pwdremind.login({
                    JSONdata: $(this).formToJSON(),
                    onFail: $.proxy(methods.loginFail, $this),
                    });
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
            $("#login-form")[0].reset();
            mod.modal('hide');
            return this;
        },

        loginFail : function(){
            mod = $(this);
            mod.find('.alert-message.error').show();
            mod.find('input[type="submit"]').removeClass('disabled').removeAttr('disabled').val('connexion');
            $("#login-form")[0].reset();
            return this;
        },

  };

  $.fn.loginModal = function(pwdremind) {
    return methods.init.call(this,pwdremind);
  };
})( jQuery );
