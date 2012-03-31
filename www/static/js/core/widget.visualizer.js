(function ( $, window, document, undefined ) {

    $.widget( "pwdremind.visualizer" , {

        //Options to be used as defaults
        options: {
            pwdremind: null,
            height: 500,
            width: 900,
            chart: "#chart"
        },

        //Setup widget
        _create: function () {
            console.log('create visualizer');
            this.element.show();
            $(document).bind('pwdremind/dataLoaded.visualizer', $.proxy(this._data_loaded, this));
            this.options.pwdremind.getAll();
        },

        _data_loaded: function (e,data) {
            //~ console.log(data);
            pwdDict = {};
            for (var i in data){
                var e = JSON.parse(data[i]['data']);
                var pwd = e['pwd'];
                var site = e['site'];
                if (pwdDict[pwd]){
                    pwdDict[pwd].push(site);
                }else{
                    pwdDict[pwd] = [site];
                }
            }
            var vis = new Visualizer();
            vis.setup(pwdDict, this.options.height, this.options.width, this.options.chart);
            vis.start();
        },

        // Destroy an instantiated plugin and clean up
        // modifications the widget has made to the DOM
        destroy: function () {
            console.log('destroy visualizer');
            // Event
            $(document).unbind('.visualizer');
            //Clear container
            $(this.options.chart).empty();
            // Hide
            $(this.element).hide();

            $.Widget.prototype.destroy.call(this);
        },

        // Respond to any changes the user makes to the
        // option method
        _setOption: function ( key, value ) {

            $.Widget.prototype._setOption.apply( this, arguments );
        }
    });

    $.pwdremind.visualizer.menu = {open:'Visualizer'};

})( jQuery, window, document );
