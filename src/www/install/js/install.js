!function ($) {

  $(function(){

    var $window = $(window);

    //Hide sections
    $('#db-configuration').hide();
    $('#add-user').hide();
    $('#final-step').hide();

    // ------------------------------------ Step 1 ------------------------------------ //

    // Database connection test
    $('#db-test').click(function(e) {
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
      if ( $('#db-alert').hasClass("alert alert-danger") )
        $('#db-alert').removeClass("alert alert-danger");
      if ( ! $('#step1to2').hasClass("disabled") )
        $('#step1to2').addClass("disabled");

      $('#db-alert').html("");
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
        $('#db-alert').addClass("alert alert-danger");
        $('#db-alert').html(data);
    };

    //Sqlite specific options
    $("#db-type").change(function(){
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

    $('#step1to2').click(function(e) {
      e.preventDefault();
      if ( ! $(this).hasClass("disabled") ) {

        var input_data = get_db_data();
        $.post("php/update_config.php", input_data, function(data) {
          if (data == 'Success!') {
            $('#db-connection').fadeOut();
            $('#db-configuration').fadeIn();
          } else {
            $('#step1to2').html('Error saving data');
          }
        });

      }
    });

    // ------------------------------------ Step 2 ------------------------------------ //

    // Database installation
    $('#install-db').click(function(e) {

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

    $('#step2to1').click(function(e) {
      e.preventDefault();
      reset_db_connection_form();
      $('#db-configuration').fadeOut();
      $('#db-connection').fadeIn();
    });

    $('#step2to3').click(function(e) {
      e.preventDefault();
      if ( ! $(this).hasClass("disabled") ) {
        $('#db-configuration').fadeOut();
        $('#add-user').fadeIn();
      }
    });

    // ------------------------------------ Step 3 ------------------------------------ //

    // Add user
    $('#create-user').click(function(e) {

      e.preventDefault();
      var user = {
        "username" : $("#add-username").val(),
        "password" : $("#add-password").val()
         };
      user = JSON.stringify(user);
  
      $.post("php/add_user.php", user, function(data) {
        if (data == 'Success!') {
          $('#create-user').addClass('btn-success');
          $('#create-user').html('User added !');
          $('#step2to3').removeClass('disabled');
        } else {
          $('#create-user').addClass('btn-danger');
          $('#create-user').html('Error...');
        }
      });
    });

    $('#step3to2').click(function(e) {
      e.preventDefault();
      $('#add-user').fadeOut();
      $('#db-configuration').fadeIn();
    });

    $('#step3to4').click(function(e) {
      e.preventDefault();
      $('#add-user').fadeOut();
      $('#final-step').fadeIn();
    });

    // ------------------------------------ Step 4 ------------------------------------ //

    $('#step4to3').click(function(e) {
      e.preventDefault();
      $('#final-step').fadeOut();
      $('#add-user').fadeIn();
    });

});


}(window.jQuery);