$(function() {
    
    $('#content').on("click", "#step4-previous", function(e) {
        e.preventDefault();
        $('#content').load('html/step3.html');
    });

});