//
//  Pwdlist widget
//
(function ( $, window, document, undefined ) {

    $.widget( "pwdremind.pwdlist" , {

        //Options to be used as defaults
        options: {
            pwdremind: null,

            $pwdtable: null,
            $search: null,
            $confirmModal: null,

            rowtpl : '<tr>'
                    +'<td><a href="{0}" target="_blank">{0}</a></td>'
                    +'<td>{1}</td>'
                    +'<td><span class="pwd">{2}</span><img src="./static/icons/eye.png" class="showpwd" alt="Show password" />'
                        +'<span style="position:relative"><img src="./static/icons/clipboard.png" class="clipboard" alt="Copy to clipboard" /></span></td>'
                    +'<td><img src="./static/icons/delete.png" class="delete" alt="delete" id="{3}" data-id="{3}"/></td>'
                    +'</tr>',
        },

        //Setup widget
        _create: function () {
            console.log('Create pwdlist');
            $(this.element).show();

            // Pwdremind event
            $(document).bind('pwdremind/afterAdd.pwdlist', $.proxy(this.postAdd, this));
            $(document).bind('pwdremind/dataLoaded.pwdlist', $.proxy(this.dataLoaded, this));

            // Confirm modal
            $("#confirm").bind('submit.pwdlist', $.proxy(function(event){
                event.preventDefault();
                id = this.options.$confirmModal.data('id');
                this.options.pwdremind.remove(id);
                this.options.$pwdtable.trigger("clearFilter");
                $('#'+id).closest('tr').remove();
                this.options.$pwdtable.trigger("update");
                this.options.$pwdtable.trigger("updateCache");
                this.options.$confirmModal.modal('hide');
            },this));

            $("#cancelDelete").bind('click.pwdlist',$.proxy(function(event) {
                event.preventDefault();
                this.options.$confirmModal.modal('hide');
            },this));



            // todo
            this.options.$pwdtable.bind('update.pwdlist', function(){
                console.log('check empty');
                if( !$("#pwdlist-sites > tbody").is(':empty') ){
                    $('#pwdlist').show();
                }else{
                    $('#pwdlist').hide();
                }});

            // todo
            this.options.$pwdtable.tablesorter().tablesorterFilter({filterContainer: $("#id_search"),
                                  filterColumns: [0,1,2],
                                  filterCaseSensitive: false});


            this.options.$pwdtable.delegate("img[class='delete']", "click.pwdlist", $.proxy(function(e) {
                this.showConfirm($(e.target).data('id'));
            },this));


            this.options.$pwdtable.delegate("img[class='showpwd']", "click.pwdlist", function(e) {
              $(e.target).prev("span").fadeToggle("slow")
            });

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

            this.options.pwdremind.getAll();
        },

        //todo
        dataLoaded: function(e,data){
            if (data){
                for (var i in data){
                    entry = JSON.parse(data[i]['data']);
                    $('#pwdlist-sites > tbody:last').append(String.format(this.options.rowtpl,entry['site'],entry['login'],entry['pwd'],data[i]['id']));
                }
                $("#pwdlist-sites").trigger("update");
                $("#pwdlist-sites").trigger("updateCache");
            }
        },

        // todo
        clearTable : function(){
            console.log('Clear Table');
            this.options.$pwdtable.trigger("clearFilter");
            $("#pwdlist-sites > tbody").empty();
            $("#pwdlist-sites").trigger("update");
            $("#pwdlist-sites").trigger("updateCache");
            $(this.element).hide();
        },

        //todo
        postAdd : function(e,id, entryJSON){
            this.options.$pwdtable.trigger("clearFilter");
            $('#pwdlist-sites > tbody:last').append(String.format(this.options.rowtpl,entryJSON['site'],entryJSON['login'],entryJSON['pwd'],id));
            $("#pwdlist-sites").trigger("update");
            $("#pwdlist-sites").trigger("updateCache");
        },

        // todo
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
