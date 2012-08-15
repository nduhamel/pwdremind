define(['backbone', '../models/category', './ressources'], function(Backbone, Category, RessourceCollection){

    return Backbone.Collection.extend({

        currentCat : undefined,

        initialize : function (models, options) {
            var ressource = options.ressource;
            this.model = Category.extend({ressource:ressource.uri});
            this.url = './'+ressource.uri+'/categories';
            this.ressourceCollection = new RessourceCollection(null,{ressource:ressource, categories: this});
            this.ressourceCollection.on('remove', _.bind(this.onRemove,this));
            this.fetchInit();
        },

        onRemove : function () {
            var cat = this.get(this.currentCat);
            var count = cat.get('dataCount');
            cat.set('dataCount',count-1);
        },

        reset : function (models, options) {
            this.currentCat = undefined;
            this.ressourceCollection.reset();
            Backbone.Collection.prototype.reset.call(this, models, options);
            return this;
        },

        fetchInit : function () {
            this.fetch({success: _.bind(this.onFirstFetch, this)});
        },

        onFirstFetch : function () {
            if ( this.length == 0 ) {
                console.log('No categories, create default: General');
                var cat = new this.model({name:'General'});
                this.add(cat);
                cat.save({success: _.bind(this.afterFetch, this) });
            } else {
                this.afterFetch();
            }
        },

        afterFetch : function () {
             var cat = this.at(0);
             this.setCurrentCatId( cat.get('id') );
        },

        setCurrentCatId : function (id) {
            if (id != this.currentCat) {
                this.currentCat = id;
                this.ressourceCollection.setCategoryId(id);
                this.trigger('category:changed', id);
            }
            return this;
        },

        getCurrentCatId : function () {
            return this.currentCat;
        },

        getRessourceCollection : function () {
            return this.ressourceCollection;
        },

        getRessourceModel : function () {
            return this.ressourceCollection.model;
        },

        addRessource : function (model) {
            if ( this.currentCat === model.get('category_id') ){
                this.ressourceCollection.add(model,{at:0});
            }
            var cat = this.get(model.get('category_id'));
            var count = cat.get('dataCount');
            cat.set('dataCount',count+1);
        },

        comparator : function (a) {
            return a.get('order');
        },
    });
});
