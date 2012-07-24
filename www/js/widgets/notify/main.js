define([
    'jquery',
    'underscore',
    'backbone',
    'sandbox',
], function($, _, Backbone, sandbox){

    var Notify = Backbone.View.extend({

        tpl : '<div class="alert" id="notify"></div>',

        el : 'body',

        render : function() {
            this.$el.append(this.tpl);
            this.setElement(this.$('#notify'));

            this.$el.hide()
                    .css('z-index',1500)
                    .css('position', 'fixed')
                    .css('top','2px')
                    .css('left','50%');

            return this;
        },

        destroy : function () {
            this.remove();
        },

        error : function (html) {
            this.show(html, 'error');
        },

        info : function (html) {
            this.show(html, 'info');
        },

        success : function (html) {
            this.show(html, 'success');
        },

        show : function (html, type) {
            var $el = this.$el;

            var wrapped = function () {
                clearTimeout($el.data('timer'));
                $el.html(html)
                   .addClass('alert-'+type)
                   .removeClass('alert-'+$el.data('type'))
                   .show()
                   .data('timer', setTimeout(function() {
                       console.log($el);
                       $el.fadeOut().dequeue();
                    }, 5*1000))
                   .data('type',type);
            };

            $el.queue(wrapped);
        }

    });

    sandbox.defineWidget('Notify', ['noteCategories','notes'], function(categories, notes){
        var notify;

        return {
            meta : {startOn:'bootstrap'},

            start : function (el) {
                notify = new Notify();
                notify.render();
                sandbox.subscribe('notify:error', notify.error, notify);
                sandbox.subscribe('notify:info', notify.info, notify);
                sandbox.subscribe('notify:success', notify.success, notify);
            },

            stop : function () {
                notify.destroy();
                notify = undefined;
            },

            destroy : function () {
                this.stop();
            },
        };
    });

});
