require.config({
  shim: {
    'jquery': {
      exports: '$'
    }
  },

  paths: {
    //Lib
    jquery: '../../js/lib/jquery'
  }

});

requirejs(['jquery','step1','step2','step3','step4'], function ($) {

  $(function() {
      
      // Load first page
      $('#content').load('html/step1.html');

  });

});