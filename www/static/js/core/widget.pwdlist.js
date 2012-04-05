//
//  Pwdlist widget
//
(function ( $, window, document, undefined ) {

    $.widget( "pwdremind.pwdlist" , {

        //Options to be used as defaults
        options: {
            pwdremind: null,

            $pwdtable: null,
            $confirmModal: null,

            rowtpl : '<tr>'
                        +'<td><a href="{0}" target="_blank">{0}</a></td>'
                        +'<td>{1}</td>'
                        +'<td>'
                            +'<span class="pwd">{2}</span><img src="./static/icons/eye.png" class="showpwd" alt="Show password" />'
                            +'<span style="position:relative"><img src="./static/icons/clipboard.png" class="clipboard" alt="Copy to clipboard" /></span>'
                        +'</td>'
                        +'<td>'
                            +'<img src="./static/icons/delete.png" class="delete" alt="delete" id="{3}" data-id="{3}"/>'
                        +'</td>'
                    +'</tr>',
        },

        //Setup widget
        _create: function () {
            console.log('Create pwdlist');

            var dataCache;
            var searchTimerId;

            var self = this;
            self.lastSearch = '';

            $(this.element).show();

            // Pwdremind event
            $(document).bind('pwdremind/afterAdd.pwdlist', $.proxy(this.postAdd, this));
            $(document).bind('pwdremind/dataLoaded.pwdlist', $.proxy(this.dataLoaded, this));

            // Confirm modal
            $("#confirm").bind('submit.pwdlist', $.proxy(function(event){
                event.preventDefault();
                id = this.options.$confirmModal.data('id');
                this.options.pwdremind.remove(id);
                $('#'+id).closest('tr').remove();
                this.options.$confirmModal.modal('hide');
            },this));

            $("#cancelDelete").bind('click.pwdlist',$.proxy(function(event) {
                event.preventDefault();
                this.options.$confirmModal.modal('hide');
            },this));

            this.options.$pwdtable.delegate("img[class='delete']", "click.pwdlist", $.proxy(function(e) {
                this.showConfirm($(e.target).data('id'));
            },this));
            // END Confirm modal

            // Show password
            this.options.$pwdtable.delegate("img[class='showpwd']", "click.pwdlist", function(e) {
              $(e.target).prev("span").fadeToggle("slow")
            });

            // Copy to clipboard
            this.options.$pwdtable.delegate("img[class='clipboard']", "click.pwdlist", function(e) {
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
            this.options.$pwdtable.delegate("th.sortable", "click.pwdlist",function(e){
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

                previous = $(this).siblings('th').removeClass('SortUp').removeClass('SortDown');

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
                    self.sortData(key,reverse);
                }
            });

            // Searching
            $("#search input").bind("keyup.pwdlist", function(e){
                clearTimeout(self.searchTimerId);
                if (e.keyCode == 13){
                    self.search();
                }else{
                    self.searchTimerId = setTimeout($.proxy(self.search,self), 500);
                }
            });
            $("#search").bind("submit.pwdlist", function(e){
                e.preventDefault();
            });

            this.options.pwdremind.getAll();
        },

        dataLoaded: function(e,data){
            dataCache = {};
            dataCache.entries = [];

            for (var i in data){
                dataCache.entries.push({
                    'id' : data[i]['id'],
                    'data' : JSON.parse(data[i]['data'])
                });
            }

            this.showTable(dataCache.entries);
        },

        showTable : function(entries){
            this.clearTable();
            var html = "";
            for (var i in entries){
                var entry = entries[i];
                html += String.format(this.options.rowtpl,
                                      entry.data['site'],
                                      entry.data['login'],
                                      entry.data['pwd'],
                                      entry.id);
            }
            $('#pwdlist-sites > tbody:last').append(html);
        },

        clearTable : function(){
            $("#pwdlist-sites > tbody").empty();
        },

        sortData: function(dataKey, reverse, data){
            var cache = data ? data : (dataCache.filtered ? dataCache.filtered : dataCache.entries);
            cache.sort(function(a,b){
                    return a.data[dataKey] > b.data[dataKey];
                });

            if (reverse){
                cache.reverse();
            }

            this.showTable(cache);
        },

        search: function (){
            var phrase = $("#search input").val();

            function has_words(text, words) {

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

            if ( phrase && phrase != this.lastSearch) {
                this.lastSearch = phrase;
                var cache = dataCache.entries.filter(doFilter(phrase.split(" ")));
                dataCache.filtered = cache;
            }else if ( !phrase ){
                 this.lastSearch = '';
                 var cache = dataCache.entries;
                 dataCache.filtered = null;
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
                this.sortData(key,reverse, cache);
            }

            this.showTable(cache);
        },

        //todo
        postAdd : function(e,id, entryJSON){
            $('#pwdlist-sites > tbody:last').append(String.format(this.options.rowtpl,entryJSON['site'],entryJSON['login'],entryJSON['pwd'],id));
        },

        showConfirm : function(id){
            this.options.$confirmModal.data('id', id);
            this.options.$confirmModal.modal({
                show: true,
                backdrop: true,
                keyboard: true
            });
        },

        // Destroy an instantiated plugin and clean up
        // modifications the widget has made to the DOM
        destroy: function () {
            console.log("Destroy pwdlist");
            dataCache = null;
            this.clearTable();
            // unbind event
            $(document).unbind('.pwdlist');
            this.options.$pwdtable.undelegate('.pwdlist');
            this.options.$pwdtable.unbind('.pwdlist');
            $("#confirm").unbind('.pwdlist');
            $("#cancelDelete").unbind('.pwdlist');
            // Hide
            $(this.element).hide();

            $.Widget.prototype.destroy.call(this);
        },

        // Respond to any changes the user makes to the
        // option method
        _setOption: function ( key, value ) {

            $.Widget.prototype._setOption.apply( this, arguments );
        }
    });
    $.pwdremind.pwdlist.menu = {open:'Passwords'};

})( jQuery, window, document );
