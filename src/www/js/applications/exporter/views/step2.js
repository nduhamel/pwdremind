define([
    'sandbox',
    'backbone',
    'sandbox',
    'text!../tpl/step2.html',
], function(sandbox, Backbone, sandbox, baseTpl){

    return sandbox.WidgetView.extend({

        initialize : function () {
            this.selected = {};
        },

        events : {
            'click a.btn' : 'onSelect',
        },

        render : function() {
            var previousOpts = this.options.exportOptions,
                ressources = {};
            _.each(previousOpts, function (data) {
                ressources[data] = sandbox.require(data+'Categories');
            });

            this.$el.html(_.template(baseTpl, {ressources:ressources}));
            return this;
        },

        onSelect : function (event) {
            var $el, type, id;
            event.preventDefault();
            $el =  $(event.target);

            if ($el.attr("name") === 'next'){
                return;
            }

            type = $el.data('type');
            id = $el.data('id');

            if (_.has(this.selected, type)) {
                if (_.include(this.selected[type],id)) {
                    $el.removeClass('active btn-primary');
                    this.selected[type] = _.without(this.selected[type], id);
                    if (this.selected[type].length === 0){
                        delete this.selected[type];
                    }
                } else {
                    this.selected[type].push(id);
                    $el.addClass('active btn-primary');
                }
            } else {
                this.selected[type] = [id];
                $el.addClass('active btn-primary');
            }
            if (!_.isEmpty(this.selected)){
                this.$('a[name="next"]').removeClass("disabled");
            }else{
                this.$('a[name="next"]').addClass("disabled");
            }
        },

        validate : function () {
            if (!_.isEmpty(this.selected)){
                return this.selected;
            }else{
                return false;
            }
        },

    });
});
