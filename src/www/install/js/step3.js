$(function() {
    
    // Add user
    $('#content').on("click", "#create-user", function(e) {

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
                $('#step2-next').removeClass('disabled');
            } else {
                $('#create-user').addClass('btn-danger');
                $('#create-user').html('Error...');
            }
        });
    });

    $('#content').on("click", "#step3-previous", function(e) {
        e.preventDefault();
        $('#content').load('html/step2.html');
    });

    $('#content').on("click", "#step3-next", function(e) {
        e.preventDefault();
        $('#content').load('html/step4.html');
    });

});