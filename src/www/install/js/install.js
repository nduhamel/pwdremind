!function ($) {

  $(function(){

    var $window = $(window);

    //Hide sections
    $('#db-configuration').hide();
    $('#add-user').hide();

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

    // Database installation
    $('#install-db').click(function(e) {

      e.preventDefault();
      var prefix = { "prefix" : $("#db-prefix").val() };
      prefix = JSON.stringify(prefix);
  
      $.post("php/install_db.php", prefix, function(data) {
        if (data == 'Success!') {
          $('#install-db').addClass('btn-success');
          $('#install-db').html('Installed !');
          $('#step2to3').removeClass('disabled');
        } else {
          $('#install-db').addClass('btn-danger');
          $('#install-db').html('Error...');
        }
      });
    });

    // Database installation
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

    var reset_db_connection_form = function() {
      // Reset style for multiple tries
      if ( $('#db-test').hasClass("btn-success") )
        $('#db-test').removeClass("btn-success");
      if ( $('#db-test').hasClass("btn-danger") )
        $('#db-test').removeClass("btn-danger");
      if ( $('#db-alert').hasClass("alert alert-danger") )
        $('#db-alert').removeClass("alert alert-danger");
      if ( ! $('#step1to2').hasClass("disabled") )
        $('#step1to2').addClass("disabled");

      $('#db-test').addClass("btn-info");
      $('#db-test').html("Testing...");
      $('#db-alert').html("");
    };

    var get_db_data = function() {
        var db_data = {
            "type" : $("#db-type").val(),
            "name" : $("#db-name").val(),
            "host" : $("#db-host").val(),
            "port" : $("#db-port").val(),
            "username" : $("#db-username").val(),
            "password" : $("#db-password").val()
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
        $('#db-connection').fadeOut();
        $('#db-configuration').fadeIn();
      }
    });

    $('#step2to1').click(function(e) {
      e.preventDefault();
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

    $('#step3to2').click(function(e) {
      e.preventDefault();
      $('#add-user').fadeOut();
      $('#db-configuration').fadeIn();
    });

});


}(window.jQuery);