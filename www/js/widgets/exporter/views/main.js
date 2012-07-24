define([
    'backbone',
    './step1',
    './step2',
    './step3',
    './final',
    'text!../tpl/base.html',
], function(Backbone, Step1View, Step2View, Step3View, FinalView, baseTpl){

    var stepOrder = [Step1View, Step2View, Step3View, FinalView];

    return Backbone.View.extend({

        events : {
            'click a[name="next"]' : 'onNextTe'
        },

        initialize : function () {
            this.exportOptions = {};
            this.step = 0;
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
            this.stepView = new stepOrder[this.step]({el:this.el, exportOptions:this.exportOptions}).render();
        },

        destroy : function () {
            if (this.stepView) {
                this.stepView.destroy();
            }
            this.$el.html('');
        },

        onNextTe : function (event) {
            var opts;
            event.preventDefault();
            opts = this.stepView.validate();
            if (opts){
                _.extend(this.exportOptions, opts);
                console.log(this.exportOptions);
                this.step++;
                this.loadStep();
            }
        },

    });
});
