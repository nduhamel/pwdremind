define([
    'sandbox',
    './models/application',
    './collections/applications',
], function(sandbox, Application, Applications){

    var applications;

    var registerApplication = function (name, meta) {
        applications.add(_.extend({name:name}, meta));
    };

    // Facade
    return {
        initialize : function () {
            console.log('Init Applications');

            applications = new Applications();
            sandbox.provide('applications', function(){return applications;});
            sandbox.subscribe('register:application', registerApplication);

        },

        reload : function () {
            console.log('Reload Applications');
            // TODO
        },

        destroy : function () {
            console.log('Destroy Applications');
            // TODO
        },
    };
});
