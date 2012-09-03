define([
    'jquery',
    'underscore',
    'sandbox'
], function($, _, sandbox){

    sandbox.defineModule({

        name : 'ping',

        timer : null,

        start : function (options) {
            this.options = options;
            this._doPing();
            sandbox.on('ping:stop', this._stopPing, this);
            sandbox.on('ping:start', function() {
                this._stopPing();
                this._doPing();
            }, this);
        },

        stop : function () {
            this._stopPing();
            sandbox.off(null,null,this);
        },

        _stopPing : function () {
            clearTimeout(this.timer);
            this.timer = null;
        },

        _startPing : function () {
            if ( this.timer !== null ){
                clearTimeout(this.timer);
            }
            this.timer = setTimeout(_.bind(this._doPing,this), this.options.interval * 1000);
        },

        _doPing : function () {
            $.get(this.options.url)
            .success(_.bind(this._startPing, this))
            .error(function(resp) {
                if (resp.status == 403) {
                    sandbox.trigger('logout');
                }else if (error) {
                    sandbox.trigger('error:network');
                }
            });
        }

    });

});
