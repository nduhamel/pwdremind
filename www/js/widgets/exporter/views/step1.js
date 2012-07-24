define([
    'backbone',
    'sandbox',
    'text!../tpl/step1.html',
], function(Backbone, sandbox, baseTpl){

    return Backbone.View.extend({

        initialize : function () {
            this.selected = [];
        },

        events : {
            'click a.btn-large' : 'onSelect',
        },

        render : function() {
            this.$el.append(_.template(baseTpl));
            this.setElement('#exporter-step');
            return this;
        },

        destroy : function () {
            this.unbind();
            this.remove();
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
                return {dataType: this.selected};
            }else {
                return false;
            }
        },

    });
});
