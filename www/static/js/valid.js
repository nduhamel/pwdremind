(function($) {
    /*
    Validation Singleton
    */
    var Validation = function() {

        var rules = {

            email : {
               check: function(value) {

                   if(value)
                       return testPattern(value,"[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])");
                   return true;
               },
            },
            url : {

               check : function(value) {

                   if(value)
                       return testPattern(value,"^https?://(.+\.)+.{2,4}(/.*)?$");
                   return true;
               },
            },
            required : {

               check: function(value) {

                   if(value)
                       return true;
                   else
                       return false;
               },
            }
        }
        var testPattern = function(value, pattern) {

            var regExp = new RegExp(pattern,"");
            return regExp.test(value);
        }
        return {

            addRule : function(name, rule) {

                rules[name] = rule;
            },
            getRule : function(name) {

                return rules[name];
            }
        }
    }

    /*
    Form factory
    */
    var Form = function(form) {

        var fields = [];

        form.find("[validation]").each(function() {
            var field = $(this);
            if(field.attr('validation') !== undefined) {
                fields.push(new Field(field));
            }
        });
        this.fields = fields;
    }
    Form.prototype = {
        validate : function() {

            for(field in this.fields) {

                this.fields[field].validate();
            }
        },
        isValid : function() {

            for(field in this.fields) {

                if(!this.fields[field].valid) {

                    this.fields[field].field.focus();
                    return false;
                }
            }
            return true;
        }
    }

    /*
    Field factory
    */
    var Field = function(field) {

        this.field = field;
        this.valid = false;
        this.attach("change");
    }
    Field.prototype = {

        attach : function(event) {

            var obj = this;
            if(event == "change") {
                obj.field.bind("change",function() {
                    return obj.validate();
                });
            }
            if(event == "keyup") {
                obj.field.bind("keyup",function(e) {
                    return obj.validate();
                });
            }
        },
        validate : function() {

            var obj = this,
                field = obj.field,
                errorClass = "error",
                types = field.attr("validation").split(" "),
                container = field.closest('.control-group'),
                errors = [];

            field.next(".error").remove();
            for (var type in types) {

                var rule = $.Validation.getRule(types[type]);
                if(!rule.check(field.val())) {

                    container.addClass("error");
                    errors.push("");
                }
            }
            if(errors.length) {

                obj.field.unbind("keyup")
                obj.attach("keyup");
                obj.valid = false;
            }
            else {
                container.removeClass("error");
                obj.valid = true;
            }
        }
    }

    /*
    Validation extends jQuery prototype
    */
    $.extend($.fn, {

        validation : function() {

            var validator = new Form($(this));
            $.data($(this)[0], 'validator', validator);

            $(this).bind("submit", function(e) {
                validator.validate();
                if(!validator.isValid()) {
                    e.preventDefault();
                }
            });
        },
        validate : function() {

            var validator = $.data($(this)[0], 'validator');
            validator.validate();
            return validator.isValid();

        }
    });
    $.Validation = new Validation();
})(jQuery);
