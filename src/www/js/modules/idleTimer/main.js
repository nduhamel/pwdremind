define([
    'jquery',
    'underscore',
    'sandbox'
], function($, _, sandbox){

    sandbox.defineModule({

        name : 'idleTimer',
        elem : document,
        throttleWait : 2000,
        timer : null,
        events:  [
            'mousemove',
            'keydown',
            'DOMMouseScroll',
            'mousewheel',
            'mousedown',
            'touchstart',
            'touchmove'
        ],

        start : function (options) {
            this.options = options;
            this._bind();
            this.timer = setTimeout(_.bind(this._onTimeout,this), this.options.timeout*1000);
        },

        stop : function () {
            $(this.elem).off('.idleTimer');
        },

        _onTimeout : function () {
            clearTimeout(this.timer);
            this.timer = null;
            sandbox.trigger('idleTimer:timeout');
        },

        _handleUserEvent : function () {
            clearTimeout(this.timer);
            this.timer = setTimeout(_.bind(this._onTimeout,this), this.options.timeout*1000);
        },

        _bind : function () {
            for (var i=0; i<this.events.length; i++) {
                $(this.elem).on(
                    this.events[i]+'.idleTimer',
                    _.throttle(_.bind(this._handleUserEvent,this), this.throttleWait)
                );
            }
        }

    });

});
