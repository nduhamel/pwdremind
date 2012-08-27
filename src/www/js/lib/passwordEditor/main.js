define([
    'jquery',
    'underscore',
    'backbone',
    'text!./tpl/passwordEditor.html',
    './pwdgen',
    'backbone_forms'
], function($, _, Backbone, baseTpl, PwdgenView) {

    passwordEditor = Backbone.Form.editors.Base.extend({

    events: {
        'keyup input':    'determineChange',
        'keypress input': function(event) {
            var self = this;
            setTimeout(function() {
              self.determineChange();
            }, 0);
        },
        'select input':   function(event) {
            this.trigger('select', this);
        },
        'focus input':    function(event) {
            this.trigger('focus', this);
        },
        'blur input':     function(event) {
            this.trigger('blur', this);
        },

        'click input+span>i' : 'toogleVisibility',

        'mouseenter i.icon-random': 'showGen',
        'mouseleave i.icon-random': 'hideGen'

    },

    initialize: function(options) {
        Backbone.Form.editors.Base.prototype.initialize.call(this, options);
    },

    render: function() {
        var $el = $(baseTpl);
        this.setElement($el);
        this.$el.attr('id', this.id);
        this.setValue(this.value);
        this.pwdgen = new PwdgenView({
            generateCallback: _.bind(this.onGeneration, this)
        });
        return this;
    },

    toogleVisibility: function(event) {
        var $btn = $(event.target);
        var $input = this.$('input').clone(true);

        if ($input.attr('type') == 'password'){
            $input.attr('type', 'text');
            $btn.removeClass('icon-eye-open').addClass('icon-eye-close');
        }else{
            $input.attr('type', 'password');
            $btn.addClass('icon-eye-open').removeClass('icon-eye-close');
        }
        this.$('input').replaceWith($input);
    },

    determineChange: function(event) {
      var currentValue = this.$('input').val();
      var changed = (currentValue != this.previousValue);

      if (changed) {
        this.previousValue = currentValue;

        this.trigger('change', this);
      }
    },

    getValue: function() {
      return this.$('input').val();
    },

    setValue: function(value) {
      this.$('input').val(value);
    },

    focus: function() {
      if (this.hasFocus) return;

      this.$('input').focus();
    },

    blur: function() {
      if (!this.hasFocus) return;

      this.$('input').blur();
    },

    select: function() {
      this.$('input').select();
    },

    showGen: function() {
        this.pwdgen.show(this.$('i.icon-random'));
    },

    hideGen: function() {
        this.pwdgen.autoClose();
    },

    onGeneration: function(pwd) {
        this.setValue(pwd);
    }

  });
    Backbone.Form.editors.passwordEditor = passwordEditor;
    return passwordEditor;
});
