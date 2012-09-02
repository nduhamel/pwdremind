$(function() {

    // Database connection test
    $('#content').on("click", "#db-test", function(e) {

        e.preventDefault();
        reset_db_connection_form();

        //Getting data
        db_data = get_db_data();

        $.post("php/test_connection.php", db_data, function(data) {
            if (data == 'Success!') {
                connection_success();
            } else {
                connection_failed(data);
            }
        });
    });

    var reset_db_connection_form = function() {
        // Reset style for multiple tries
        if ( $('#db-test').hasClass("btn-success") )
            $('#db-test').removeClass("btn-success");
        if ( $('#db-test').hasClass("btn-danger") )
            $('#db-test').removeClass("btn-danger");
        if ( $('#db-test').hasClass("btn-info") )
            $('#db-test').removeClass("btn-info");
        if ( $('#step1-error').hasClass("alert alert-danger") )
            $('#step1-error').removeClass("alert alert-danger");
        if ( ! $('#step1to2').hasClass("disabled") )
            $('#step1to2').addClass("disabled");
         
        $('#step1-error').html("");
        $('#db-test').html("Test connection");
    };

    var get_db_data = function() {

        var type = $("#db-type").val();
        var name = $("#db-name").val();
        var host = $("#db-host").val();
        var port = $("#db-port").val();
        var PDO_DSN = "";

        if ( $("#db-type").val() == 'sqlite')
        PDO_DSN = type + ':../' + name + '.db';
        else
        PDO_DSN = type + ':host=' + host + ';port=' + port + ';dbname=' + name;

        var db_data = {
            "PDO_DRIVER" : type,
            "PDO_DSN" : PDO_DSN,
            "PDO_USER" : $("#db-username").val(),
            "PDO_PASSWORD" : $("#db-password").val()
        };
        return JSON.stringify(db_data);
    };

    var connection_success = function(){
        $('#db-test').removeClass("btn-info");
        $('#db-test').html("It works!");
        $('#db-test').addClass("btn-success");
        $('#step1to2').removeClass("disabled");
    };

    var connection_failed = function(data){
        $('#db-test').removeClass("btn-info");
        $('#db-test').html("It doesn't work..");
        $('#db-test').addClass("btn-danger");
        $('#step1to2').addClass("disabled");
        $('#step1-error').addClass("alert alert-danger");
        $('#step1-error').html(data);
    };

    //Sqlite specific options
    $("#content").on("change", "#db-type", function() {
        reset_db_connection_form();
        $('#db-test').html("Test connection");
        if ( $(this).val() == "sqlite" ) {
            $("#db-host").parent().parent().fadeOut();
            $("#db-port").parent().parent().fadeOut();
            $("#db-username").parent().parent().fadeOut();
            $("#db-password").parent().parent().fadeOut();
        } else {
            $("#db-host").parent().parent().fadeIn();
            $("#db-port").parent().parent().fadeIn();
            $("#db-username").parent().parent().fadeIn();
            $("#db-password").parent().parent().fadeIn();
        }

    });

    $('#content').on("click", "#step1to2", function(e) {
        e.preventDefault();
        if ( ! $(this).hasClass("disabled") ) {

            var input_data = get_db_data();
            $.post("php/update_config.php", input_data, function(data) {
                if (data == 'Success!') {
                    $('#content').load('html/step2.html');
                } else {
                    $('#step1to2').html('Error saving data');
                }
            });

        }
    });
});