$(function() {

    // Database installation
    $('#content').on("click", "#install-db", function(e) {

        e.preventDefault();
        var prefix = { "DB_PREFIX" : $("#db-prefix").val() };
        prefix = JSON.stringify(prefix);

        $('#db-test').addClass("btn-info");
        $('#db-test').html("Installing...");

        $.post("php/update_config.php", prefix, function(data) {
            if (data == 'Success!') {

                // If prefix saved launch install script
                $.get("php/install_db.php", function(data) {
                    if (data == 'Success!') {
                        $('#install-db').addClass('btn-success');
                        $('#install-db').html('Installed !');
                        $('#step2to3').removeClass('disabled');
                    } else {
                        $('#install-db').addClass('btn-danger');
                        $('#install-db').html('Error...');
                    }
                });

            } else {
                $('#install-db').addClass('btn-danger');
                $('#install-db').html('Error...');
            }
        });
    });

    $('#content').on("click", "#step2to1", function(e) {
        e.preventDefault();
        //reset_db_connection_form();
        $('#content').load('html/step1.html');
    });

    $('#content').on("click", "#step2to3", function(e) {
        e.preventDefault();
        if ( ! $(this).hasClass("disabled") ) {
            $('#content').load('html/step3.html');
        }
    });
});