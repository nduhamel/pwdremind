(function( $ ){

    var defaults = {};

    var pwdremind;

    var onSubmit = function ($elem){

        var $masterForm = $elem.find("#addentry"),
            $notes = $elem.find("#addentryNote textarea"),
            data;

        if(!$masterForm.validate()){
            return false;
        };

        data = $masterForm.formToJSON();
        console.log(data);
        data.notes = $notes.val();
        pwdremind.add(data);
        $elem.modal('hide');
        reset($elem);
    };

    var reset = function ($elem){
        $elem.find("#addentry")[0].reset();
        $elem.find("#addentryNote textarea").val('');
    }

    var methods = {
        init : function( options ) {
            return this.each(function(){
                var $this = $(this);

                pwdremind = options.pwdremind;

                $this.modal({
                    show: false,
                    backdrop: 'static',
                    keyboard: false,
                });

                $this.find("#addentry").validation();

                $this.find("button[type='submit']").bind('click',function(e){
                    e.preventDefault();
                    onSubmit($this);
                });

                $this.find(".close, button[type='cancel']").bind('click',function(e){
                    e.preventDefault();
                    methods.hide.apply( $this, [true] )
                });

                $('#add-confirm-modal').modal({
                    show: false,
                    backdrop: 'static',
                    keyboard: false,
                });

                $('#add-confirm-modal').find("button[type='submit']").bind('click',function(e){
                    e.preventDefault();
                    $('#add-confirm-modal').modal('hide');
                    reset($this);
                });

                $('#add-confirm-modal').find("button[type='cancel']").bind('click',function(e){
                    e.preventDefault();
                    $('#add-confirm-modal').modal('hide');
                    methods.show.apply( $this );
                });

            });
        },

        show : function( ) {
            return this.each(function(){
                var $this = $(this);

                $this.modal('show')
                .css({
                        width: 'auto',
                        'margin-left': function () {
                            return -($(this).width() / 2);
                        }
                });
            });
        },

        hide : function( confirm ) {
            return this.each(function(){
                var $this = $(this);
                $this.modal('hide');
                if (confirm){
                    $('#add-confirm-modal').modal('show');
                }else{
                    reset($this);
                }
            });
        },

    };

    $.fn.addEditModal = function( method ) {
        // Method calling logic
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.addEditModal' );
        }
    };

})( jQuery );
