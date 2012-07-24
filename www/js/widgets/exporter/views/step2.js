define([
    'backbone',
    'sandbox',
    'text!../tpl/step2.html',
], function(Backbone, sandbox, baseTpl){

    return Backbone.View.extend({

        initialize : function () {
            this.selected = {};
        },

        events : {
            'click a.btn' : 'onSelect',
        },

        render : function() {
            var that = this,
                previousOpts = this.options.exportOptions.dataType,
                request = _.map(previousOpts, function(opt){ return opt+'Categories'; });

            sandbox.require(request,function(){
                var args = _.toArray(arguments),
                    dataType = _.zip(previousOpts,args);

                that.$el.append(_.template(baseTpl, {dataType:dataType}));

                that.setElement('#exporter-step');
            });
            return this;
        },

        destroy : function () {
            this.unbind();
            this.$el.remove();
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
                return {categories:this.selected};
            }else{
                return false;
            }
        },

    });
});
