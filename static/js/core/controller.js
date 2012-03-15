//
//  App controller
//
(function ( $, window, document, undefined ) {

    $.widget( "pwdremind.controller" , {

        //Options to be used as defaults
        options: {
        },

        //Setup widget
        _create: function () {
            this.openedView = null;
            this.default_view = this.options.default_view;
            var views = this.options.views;
            console.log('Start controller')

            for (var viewname in views){
                console.log("Controller add view: "+ viewname);
                // Add menu entry
                this.element.append('<li><a href="#'+viewname+'">'+$.pwdremind[viewname].menu.open+'</a></li>');
                // Bind menu entry
                $(this.element).find("a[href='#"+viewname+"']").click($.proxy(function (e) {
                        e.preventDefault();
                        var viewname = $(e.target).attr('href').slice(1);
                        this._openview(viewname);
                    },this));
                // Hide section
                $(views[viewname].elem).hide();
            }

            $(document).bind('pwdremind/login.controller', $.proxy(this._open_default, this));
            $(document).bind('pwdremind/logout.controller', $.proxy(this._close_all, this));
        },

        _open_default: function (){
            this._openview(this.default_view);
        },

        _openview: function (viewname) {
            console.log('Controller open view:'+viewname);
            if (this.openedView){
                if( this.openedView[0] == viewname){
                    return;
                }
                $(this.element).find("a[href='#"+this.openedView[0]+"']").closest('li').removeClass('active');
                $(this.openedView[1].elem)[this.openedView[0]]('destroy');
            }
            $(this.element).find("a[href='#"+viewname+"']").closest('li').addClass('active');
            var view = this.options.views[viewname];
            $(view.elem)[viewname](view.options);
            this.openedView = [viewname, view];
        },

        _close_all: function () {
            if (this.openedView){
                $(this.element).find("a[href='#"+this.openedView[0]+"']").closest('li').removeClass('active');
                $(this.openedView[1].elem)[this.openedView[0]]('destroy');
                this.openedView = null;
            }
        },

        // Destroy an instantiated plugin and clean up
        // modifications the widget has made to the DOM
        destroy: function () {

            $(document).unbind('.controller');

            $.Widget.prototype.destroy.call(this);
        },

        // Respond to any changes the user makes to the
        // option method
        _setOption: function ( key, value ) {

            $.Widget.prototype._setOption.apply( this, arguments );
        }
    });

})( jQuery, window, document );
