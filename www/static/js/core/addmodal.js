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
        data.notes = $notes.val();

        if ( $elem.data('editmode-id') ){
            if ( isModified($elem) ){
                pwdremind.update($elem.data('editmode-id'), data);
            }
        }else{
            pwdremind.add(data);
        }

        $elem.modal('hide');
        reset($elem);
    };

    var reset = function ($elem){
        $elem.find("#addentry")[0].reset();
        $elem.find("#addentryNote textarea").val('');
        $elem.find("#addentry .control-group").removeClass('error');
    };

    var populate = function ($elem, user_data){
        var data = JSON.parse(user_data.data);
        $elem.find("#addentry input").each(function(){
            var $this = $(this);
            var name = $this.attr("name");
            $this.val(data[name]);
            $this.data('initialValue', data[name]);
        });
        if (data['notes']){
            $elem.find("#addentryNote textarea").val(data['notes']);
            $elem.find("#addentryNote textarea").data('initialValue', data['notes']);
        }else{
            $elem.find("#addentryNote textarea").data('initialValue','');
        }
    };

    var empty = function ($elem){
        var isempty = true;

        $elem.find("#addentry input").each(function(){
            if ( $(this).val() ){
                isempty = false;
            }
        });
        if ( $elem.find("#addentryNote textarea").val() ){
            isempty = false;
        }
        return isempty;
    }

    var isModified = function ($elem){
        var modified = false;
        $elem.find("input, textarea").each(function(){
            var $this = $(this),
                initial = $this.data('initialValue');

            if ( initial != $this.val() ){
                modified = true;
            }
        });
        return modified;
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

            });
        },

        show : function( data_id ) {
            return this.each(function(){
                var $this = $(this);

                // edit mode
                if (data_id){
                    var data = pwdremind.get(data_id);
                    populate($this, data);
                    $this.data('editmode-id', data_id);
                }

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
                if (confirm && ( ( $this.data('editmode-id') && isModified($this) ) || ( !$this.data('editmode-id') && !empty($this))  ) ){
                    bootbox.confirm("Etes-vous sur de vouloir annuler?", "Revenir en arriere", "Oui", function(result) {
                        if (result) {
                            reset($this);
                        } else {
                            methods.show.apply( $this );
                        }
                    });
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
