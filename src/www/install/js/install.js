!function ($) {

  $(function(){

    var $window = $(window);

    // side bar
    $('.sidenav').affix();

    //Hide save
    $('#db-save').hide();

    // Database connection test
    $('#db-test').click(function(e) {

      e.preventDefault();
      reset_db_form();

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

    var reset_db_form = function() {
      // Reset style for multiple tries
      if ( $('#db-test').hasClass("btn-success") )
        $('#db-test').removeClass("btn-success");
      if ( $('#db-test').hasClass("btn-danger") )
        $('#db-test').removeClass("btn-danger");
      if ( $('#db-alert').hasClass("alert alert-danger") )
        $('#db-alert').removeClass("alert alert-danger");

      $('#db-save').hide();
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
        $('#db-save').fadeIn();
    };

    var connection_failed = function(data){
        $('#db-test').removeClass("btn-info");
        $('#db-test').html("It doesn't work..");
        $('#db-test').addClass("btn-danger");
        $('#db-save').fadeOut();
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


});


}(window.jQuery);