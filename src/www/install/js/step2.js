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
                    if (data == 'Success!')
                        install_success();
                    else
                        install_failed(data);
                });

            } else {
                update_failed();
            }
        });
    });

    var install_success = function() {
        $('#install-db').addClass('btn-success');
        $('#install-db').html('Installed !');
        $('#step2to3').removeClass('disabled');
    };

    var install_failed = function(data) {
        $('#install-db').addClass('btn-danger');
        $('#install-db').html('Error...');
        $('#step2-error').addClass("alert alert-danger");
        $('#step2-error').html("Failed to install database...<br>"+data);
    };

    var update_failed = function () {
        $('#install-db').addClass('btn-danger');
        $('#install-db').html('Error...');
        $('#step2-error').addClass("alert alert-danger");
        $('#step2-error').html("Failed to update config with prefix...");
    };


    $('#content').on("click", "#step2to1", function(e) {
        e.preventDefault();
        $('#content').load('html/step1.html');
    });

    $('#content').on("click", "#step2to3", function(e) {
        e.preventDefault();
        if ( ! $(this).hasClass("disabled") ) {
            $('#content').load('html/step3.html');
        }
    });
});