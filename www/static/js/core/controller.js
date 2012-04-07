//
//  App controller
//

var Controller = (function ($, window, document, View, undefined) {

    var openedView;
    var defaultView;
    var views;
    var $menu;
    var Pwdremind;

    var init = function (pwdremind, defView){
        $menu = $('ul#controller');
        defaultView = defView;
        Pwdremind = pwdremind;
        views = {};

        var sortView = function (a,b) {
            return (a.order || 0) - (b.order || 0);
        };

        for (var i in View.sort(sortView) ) {
            var view = View[i];
            // Add menu entry
            $menu.append('<li><a href="#'+view.name+'">'+view.label+'</a></li>');
            // Bind menu entry
            $menu.find("a[href='#"+view.name+"']").click(function (e) {
                e.preventDefault();
                var viewname = $(e.target).attr('href').slice(1);
                openView(viewname);
            });
            // Hide section
            $('#'+view.name).hide();

            // Cache view
            views[view.name] = view;
        }
        console.log(views)
        $(document).bind('pwdremind/login.controller', function(){openView(defaultView);} );
        $(document).bind('pwdremind/logout.controller', closeAll );
    };

    var openView = function (viewname) {
        var view = views[viewname];

        if ( openedView ){
            if( openedView.name == viewname){
                return;
            }
            $menu.find("a[href='#"+openedView.name+"']").closest('li').removeClass('active');
            openedView.destroy();
        }

        $menu.find("a[href='#"+viewname+"']").closest('li').addClass('active');
        view.create(Pwdremind);
        openedView = view;
    };

    var closeAll = function (){
        if (openedView){
            $menu.find("a[href='#"+openedView.name+"']").closest('li').removeClass('active');
            openedView.destroy();
            openedView = null;
        }
    };


    return {
        'init' : init,
    };

}( $, window, document, View));
