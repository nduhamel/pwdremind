var View = View || [];

(function ($, window, document, View, undefined) {

    var Pwdremind;

    var options = {
        height: 500,
        width: 900,
        chart: "#chart"
    };

    var $section;

    var create = function (pwdremind){
        console.log('create visualizer');
        Pwdremind = pwdremind;
        $section = $('#visualizer');

        $section.show();

        $(document).bind('pwdremind/dataLoaded.visualizer', dataLoaded );

        Pwdremind.getAll();
    };

    var dataLoaded = function (e,data) {
        pwdDict = {};
        for (var i in data){
            var e = JSON.parse(data[i]['data']);
            var pwd = e['pwd'];
            var site = e['site'];
            if (pwdDict[pwd]){
                pwdDict[pwd].push(site);
            }else{
                pwdDict[pwd] = [site];
            }
        }
        var vis = new Visualizer();
        vis.setup(pwdDict, options.height, options.width, options.chart);
        vis.start();
    };

    var destroy = function (){
        console.log('destroy visualizer');
        // Event
        $(document).unbind('.visualizer');
        //Clear container
        $(options.chart).empty();
        // Hide
        $section.hide();
    };

    var public = {
        'create' : create,
        'destroy' : destroy,
        'name'  : 'visualizer',
        'label' : 'Visualizer',
    };

    View.push(public);

}( $, window, document, View));
