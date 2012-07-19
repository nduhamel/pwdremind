define([
    'sandbox',
    './models/application',
    './collections/applications',
], function(sandbox, Application, Applications){

    var applications;

    var registerApplication = function (appInfo) {
        applications.add(appInfo);
    };

    // Facade
    return {
        initialize : function () {
            console.log('Init Applications');

            applications = new Applications();
            sandbox.subscribe('register:application', registerApplication);
            sandbox.subscribe('request:applications', function (callback) {
                callback(applications);
            });
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
