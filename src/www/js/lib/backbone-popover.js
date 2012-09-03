define([
    'jquery',
    'underscore',
    'backbone'
], function($,_,Backbone) {

    var Popover = Backbone.View.extend({

        defaultOptions : {
            placement: 'right',
            content: '',
            template: '<div class="popover"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content"><p></p></div></div></div>',
            title: '',
        },

        visible: false,

        initialize : function(options) {
            this.options = _.extend(this.defaultOptions, options);
            this.setElement($(this.options.template));
        },

        toogle : function ($el) {
            console.log('toogle');
            this[this.visible ? 'hide' : 'show']($el)
        },

        show: function ($el) {
            var pos,
                actualWidth,
                actualHeight,
                placement,
                tp;

            this.setContent();

            this.$el
            .detach()
            .css({ top: 0, left: 0, display: 'block' })
            .appendTo(document.body);

            pos = this.getPosition($el);

            actualWidth = this.$el[0].offsetWidth;
            actualHeight = this.$el[0].offsetHeight;

            switch (this.options.placement) {
              case 'bottom':
                tp = {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2}
                break
              case 'top':
                tp = {top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2}
                break
              case 'left':
                tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth}
                break
              case 'right':
                tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width}
                break
            }

            this.$el
            .css(tp)
            .addClass(this.options.placement)
            .addClass('in');

            this.visible = true;
        },

        setContent: function () {
            this.$('.popover-title').html(this.options.title);
            this.$('.popover-content > *').html(this.options.content);
            this.$el.removeClass('fade in top bottom left right');
        },

        hide: function () {
            this.$el.removeClass('in');
            this.$el.detach();
            this.visible = false;
            return this;
        },

        getPosition: function ($el) {
            return $.extend({}, $el.offset(), {
                width: $el[0].offsetWidth,
                height: $el[0].offsetHeight
            });
        },

    });

    return Popover;
});
