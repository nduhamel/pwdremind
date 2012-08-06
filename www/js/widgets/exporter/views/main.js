define([
    'sandbox',
    'backbone',
    './step1',
    './step2',
    './step3',
    './final',
    'text!../tpl/base.html',
], function(sandbox, Backbone, Step1View, Step2View, Step3View, FinalView, baseTpl){

    return sandbox.WidgetView.extend({

        events : {
            'click a[name="next"]' : 'onNextTe'
        },

        initialize : function () {
            this.exportOptions = {};
            this.step = 0;
            this.stepOrder = [Step1View, Step2View, Step3View, FinalView];
        },

        render : function() {
            this.$el.html(_.template(baseTpl));
            this.loadStep();
            return this;
        },

        loadStep : function () {
            if (this.stepView) {
                this.stepView.destroy();
            }
            this.stepView = new this.stepOrder[this.step]({appendToEl:this.el, exportOptions:this.exportOptions}).render();
        },

        onDestroy : function () {
            if (this.stepView) {
                this.stepView.destroy();
            }
        },

        onNextTe : function (event) {
            console.log(this);
            var opts;
            event.preventDefault();
            opts = this.stepView.validate();
            if (opts){
                _.extend(this.exportOptions, opts);
                this.step++;
                this.loadStep();
            }
        },

    });
});
