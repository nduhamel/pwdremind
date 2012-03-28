(function(){
    console.log('Local bookmarklet app');
    console.log(localStorage);
    window.parent.postMessage("hello there!", document.location.hash.slice(1));
})();
