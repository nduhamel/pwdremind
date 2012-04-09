var View = View || [];

(function ($, window, document, View, undefined) {

    var Pwdremind;
    var dataCache;
    var searchTimerId;
    var lastSearch;

    var $section;
    var $pwdtable;
    var $confirmModal;

    var rowtpl = '<tr>'
                    +'<td><a href="{0}" target="_blank">{0}</a></td>'
                    +'<td>{1}</td>'
                    +'<td>'
                        +'<span class="pwd">{2}</span><span><img src="./static/icons/eye.png" class="showpwd" alt="Show password" /></span>'
                        +'<span style="position:relative"><img src="./static/icons/clipboard.png" class="clipboard" alt="Copy to clipboard" /></span>'
                        +'<span><img src="./static/icons/delete.png" class="delete" alt="delete" id="{3}" data-id="{3}"/></span>'
                    +'</td>'
                +'</tr>';

    var create = function (pwdremind){
        console.log('Create pwdlist');
        Pwdremind = pwdremind;

        $section = $('#pwdlist');
        $pwdtable = $("#pwdlist-sites");
        $confirmModal = $('#confirm-modal');

        // Show container
        $section.show();

        // Pwdremind event
        $(document).bind('pwdremind/afterAdd.pwdlist', postAdd );
        $(document).bind('pwdremind/dataLoaded.pwdlist', dataLoaded );
        $(document).bind('pwdremind/afterRemove.pwdlist', postRemove );

        // Confirm modal
        $pwdtable.delegate("img[class='delete']", "click.pwdlist", function(e) {
            showConfirm($(e.target).data('id'));
        });
        $("#cancelDelete").bind('click.pwdlist',function(e) {
            e.preventDefault();
            $confirmModal.modal('hide');
        });
        $("#confirm").bind('submit.pwdlist', function(e){
            e.preventDefault();
            id = $confirmModal.data('id');
            Pwdremind.remove(id);
            $confirmModal.modal('hide');
        });
        // END Confirm modal

        // Show password
        $pwdtable.delegate("img[class='showpwd']", "click.pwdlist", function(e) {
            $(e.target).parent("span").prev('span').fadeToggle("slow")
        });

        // Copy to clipboard
        $pwdtable.delegate("img[class='clipboard']", "click.pwdlist", function(e) {
            $img = $(e.target);
            $img.attr('src','./static/icons/arrow1.png');
            $img.removeClass('clipboard').addClass('go');
            href = $img.closest('tr').find("a").attr('href');
            pwd =  $img.closest('td').find('span').text();
            $(e.target).zclip({
                path: './static/media/ZeroClipboard.swf',
                copy: pwd,
                afterCopy:function(){
                    $(this).zclip('remove');;
                    $(this).attr('src','./static/icons/clipboard.png');
                    $(this).removeClass('go').addClass('clipboard');
                    window.open(href);
                },
                clickAfter: false,
            });
        });

        // Sorting
        $pwdtable.delegate("th.sortable", "click.pwdlist",function(e){
            // find correspondance between col index and data key
            var key;
            var previous;
            var sort;
            var reverse = false;

            switch ( $(this).closest('th').index() ){
                case 0:
                key = 'site';
                break;
                case 1:
                key = 'login';
                break;
            }

            previous = $(this).siblings('th').removeClass('SortUp').removeClass('SortDown').data('sort','');

            sort = $(this).data('sort');
            if ( sort == 'down'){
                $(this).removeClass('SortDown').addClass('SortUp');
                $(this).data('sort','up');
            }else if ( sort == 'up' ){
                $(this).addClass('SortDown').removeClass('SortUp');
                $(this).data('sort','down');
                reverse = true;
            }else{
                $(this).addClass('SortUp');
                $(this).data('sort','up');
            }

            if (key){
                sortData(key,reverse);
            }
        });

        // Searching
        $("#search input").bind("keyup.pwdlist", function(e){
            clearTimeout(searchTimerId);
            if (e.keyCode == 13){
                search();
            }else{
                searchTimerId = setTimeout(search, 500);
            }
        });
        $("#search").bind("submit.pwdlist", function(e){
            e.preventDefault();
        });

        Pwdremind.getAll();
    };

    var destroy = function (){
        console.log('Destroy pwdlist');
        dataCache = null;
        clearTimeout(searchTimerId);
        lastSearch = null;
        $('.SortUp, .SortDown').removeClass('SortUp').removeClass('SortDown').data('sort','');
        clearTable();
        // unbind event
        $(document).unbind('.pwdlist');
        $pwdtable.undelegate('.pwdlist');
        $pwdtable.unbind('.pwdlist');
        $("#confirm").unbind('.pwdlist');
        $("#cancelDelete").unbind('.pwdlist');
        // Hide
        $section.hide();
    };

    var dataLoaded = function(e,data){
        dataCache = {};
        dataCache.entries = [];

        for (var i in data){
            dataCache.entries.push({
                'id' : data[i]['id'],
                'data' : JSON.parse(data[i]['data'])
            });
        }

        showTable(dataCache.entries);
    };

    var showTable = function(entries){
        clearTable();
        var html = "";
        for (var i in entries){
            var entry = entries[i];
            html += String.format(rowtpl,
                                  entry.data['site'],
                                  htmlEntities(entry.data['login']),
                                  htmlEntities(entry.data['pwd']),
                                  entry.id);
        }
        $('#pwdlist-sites > tbody:last').append(html);
    };

    var clearTable = function(){
        $("#pwdlist-sites > tbody").empty();
    };

    var sortData = function(dataKey, reverse, data){
        var cache = data ? data : (dataCache.filtered ? dataCache.filtered : dataCache.entries);
        cache.sort(function(a,b){
                return a.data[dataKey] > b.data[dataKey];
            });

        if (reverse){
            cache.reverse();
        }

        showTable(cache);
    };

    var search = function (){
        var phrase = $("#search input").val();

        function has_words(text, words) {
            text = text.toLowerCase();
            for (var i=0; i < words.length; i++) {
              if (words[i].charAt(0) == '-') {
                if (text.indexOf(words[i].substr(1)) != -1) return false; // Negated word must not be in text
              } else if (text.indexOf(words[i]) == -1) return false; // Normal word must be in text
            }

            return true;
        }

        function doFilter(phrase){
            return function (element, index, array){
                return (has_words(element.data.site,phrase) || has_words(element.data.login,phrase));
            }
        }

        if ( phrase && phrase != lastSearch) {
            lastSearch = phrase;
            var cache = dataCache.entries.filter(doFilter(phrase.toLowerCase().split(" ")));
            dataCache.filtered = cache;
        }else if ( !phrase ){
             lastSearch = '';
             var cache = dataCache.entries;
             dataCache.filtered = null;
        }else{
            cache = dataCache.filtered;
        }

        var sortTh = $('.SortUp, .SortDown').first();
        if ( sortTh.length ){
            var reverse = false;
            var key;
            if ( $(sortTh[0]).data('sort') == 'down'){
                reverse = true
            }
            switch ( $(sortTh[0]).index() ){
                case 0:
                key = 'site';
                break;
                case 1:
                key = 'login';
                break;
            }
            sortData(key,reverse, cache);
        }

        showTable(cache);
    };

    var postAdd = function (e,id, entryJSON){
        dataCache.entries.push({
            'id' : id,
            'data' : entryJSON
        });
        $("#search input").val('');
        search();
    };

    var postRemove = function (e, id){
        console.log(id);
        dataCache.entries = dataCache.entries.filter(function(elem,i,a){return (elem.id !=  id)});
        if ( dataCache.filtered ){
            dataCache.filtered = dataCache.filtered.filter(function(elem,i,a){ return (elem.id !=  id)});
        }
        search();
    };

    var showConfirm = function(id){
        $confirmModal.data('id', id);
        $confirmModal.modal({
            show: true,
            backdrop: true,
            keyboard: true
        });
    };

    var public = {
        'create' : create,
        'destroy' : destroy,
        'label' : 'Passwords',
        'name'  : 'pwdlist',
        'order' : -100,
    };

    View.push(public);

}( $, window, document, View));
