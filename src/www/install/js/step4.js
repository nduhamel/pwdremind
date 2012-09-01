$(function() {
    
    $('#content').on("click", "#step4to3", function(e) {
        e.preventDefault();
        $('#content').load('html/step3.html');
    });

});