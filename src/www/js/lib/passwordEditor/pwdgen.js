define([
    'jquery',
    'underscore',
    'backbone',
    'text!./tpl/pwdgen.html',
    'popover',
    'pwdgen'
], function($, _, Backbone, baseTpl, Popover, passwordGenerator) {

    return Popover.extend({

        events: {
            'mouseenter': 'onMouseEnter',
            'mouseleave': 'onMouseLeave',
            'click button': 'generate'
        },

        timer: null,

        delay: 1000,

        initialize: function(options) {
            var popoverOptions = {
                title: 'Generate password',
                content: _.template(baseTpl, {id:this.cid}),
                placement: 'left'
            };
            this.generateCallback = options.generateCallback;
            Popover.prototype.initialize.call(this, popoverOptions);
        },

        autoClose: function() {
            this.timer = setTimeout(_.bind(this.hide,this), this.delay);
        },

        onMouseEnter: function() {
            if (this.visible) {
                clearTimeout(this.timer);
            }
        },

        onMouseLeave: function() {
            if (this.visible) {
                clearTimeout(this.timer);
                this.hide();
            }
        },

        generate: function(event) {
            event.preventDefault();
            var options = {}
            var choose = $('form#'+this.cid+' input[name=pwdgen-option]:checked').val();
            switch (choose){
                case 'alphanumeric':
                options.special = false;
                break;

                case 'alpha':
                options.special = false;
                options.number = false;
                break;

                case 'numeric':
                options.special = false;
                options.letter = false;
                break;
            }
            this.generateCallback(passwordGenerator(options));
            this.hide();
        }


    });
});
