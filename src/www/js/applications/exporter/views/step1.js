define([
    'sandbox',
    'backbone',
    'sandbox',
    'text!../tpl/step1.html',
], function(sandbox, Backbone, sandbox, baseTpl){

    return sandbox.WidgetView.extend({

        initialize : function () {
            this.selected = [];
        },

        events : {
            'click a.btn-large' : 'onSelect',
        },

        render : function() {
            this.$el.html(_.template(baseTpl));
            return this;
        },

        onSelect : function (event) {
            var name,
                $el;
            event.preventDefault();
            $el =  $(event.target);
            name = $el.attr('name');
            if (_.include(this.selected, name)) {
                $el.removeClass('active btn-primary');
                this.selected = _.without(this.selected, name);
            }else{
                this.selected.push(name);
                $el.addClass('active btn-primary');
            }
            if (this.selected.length > 0){
                this.$('a[name="next"]').removeClass("disabled");
            }else {
                this.$('a[name="next"]').addClass("disabled");
            }
        },

        validate : function () {
            if (this.selected.length > 0){
                return this.selected;
            }else {
                return false;
            }
        },

    });
});
