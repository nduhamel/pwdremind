(function ( $, window, document, undefined ) {

    var fill = d3.scale.category10();
    var loginData,vis,w,h, chart;

    function setup (data, height, width, chartelem) {
        w = width;
        h = height;
        chart = chartelem;

        vis = d3.select(chart)
            .append("svg:svg")
            .attr("width", w)
            .attr("height", h);

        loginData = getLoginsJSON(data);
    }

    function start () {
        var force = d3.layout.force()
        .charge(-100)
        .nodes(loginData.nodes)
        .links(loginData.links)
        .size([w, h])
        .start();

        var link = vis.selectAll("line.link")
        .data(loginData.links)
        .enter().append("svg:line")
        .attr("class", "link")
        .style("stroke-width", function(d) { return d.value; })
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })
        .style("stroke", function(d) { return fill(d.value); });

        var circleNodes = vis.selectAll(".node")
        .data(
            loginData.nodes.filter(
                function(x) {
                    return x.group != 2;
                }))
        .enter().append("svg:circle")
        .attr("class", function(n) {  // HACK
            return "node group"+n.group;
        })
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", function(n) {
            if (n.group == 1)
                return 5;
            return 7;
        })
        .style("fill", function(d) { return fill(d.group); })
        .call(force.drag)

        var rectNodes = vis.selectAll('.node').data(loginData.nodes)
        .enter().append("svg:rect")
        .attr("class", "node")
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; })
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", function(d) { return fill(d.group); })
        .call(force.drag);


        vis.style("opacity", 1e-6)
          .transition()
            .duration(1000)
            .style("opacity", 1);

        force.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
              .attr("y1", function(d) { return d.source.y; })
              .attr("x2", function(d) { return d.target.x; })
              .attr("y2", function(d) { return d.target.y; });

            circleNodes.attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return d.y; });

            rectNodes.attr("x", function(d) { return d.x - (rectNodes.attr('width')/2); })
                .attr("y", function(d) { return d.y - (rectNodes.attr('height')/2); });

        });

        $('circle,rect').popover({
            live: true,
            html: true,
            delay: {hide: 500},
            offset: 40,
            title: function(){
                if (this.__data__.group == 0){
                    return "Mot de passe";
                }
                if (this.__data__.group == 1){
                    return "Site";
                }
                if (this.__data__.group == 2){
                    return "Lien de ressemblance";
                }
            },
            content: function(){
                if (this.__data__.group == 0){
                    pwdstrength = chkPass(this.__data__.name);
                    var nScore = pwdstrength.total;
                    var cClass = "weak";
                    if (nScore >= 40 && nScore < 60) { cClass = "strong"; }
                    else if (nScore >= 60 && nScore < 80) { cClass = "stronger"; }
                    else if (nScore >= 80) { cClass = "strongest"; }
                    return '<div id="complexity" class="'+cClass+'">'+pwdstrength.total+'</div>';
                }
                if (this.__data__.group == 1){
                    return '<a href="'+this.__data__.name+'">'+this.__data__.name+'</a>';
                }
                if (this.__data__.group == 2){
                    return "Les mots de passe li\u00e9s \u00e0 ce noeud sont tr\u00e8s ressemblant";
                }
            },
        });
    }

    function getLoginsJSON(loginsTable) {
        var nodes = [];
        var links = [];
        var loginsTable = loginsTable // HACK here!
        var passwordsDict = {};
        for (var password in loginsTable) {
            nodes.push({
                    name: password,
                    group: 0
            });
            var passwordIdx = nodes.length-1;
            passwordsDict[password] = passwordIdx;
            for (var site in loginsTable[password]) {
                nodes.push({
                    name: loginsTable[password][site], //.host, HACK here !
                    group: 1
                });
                links.push({
                    source: passwordIdx,
                    target: nodes.length-1,
                    value: 1
                });
            }
        }
        // Add warning edges between similar passwords
        var similarPasswordPairs = detectSimilarPasswords(loginsTable);
        for (var pairX in similarPasswordPairs) {
            var pair = similarPasswordPairs[pairX];
            nodes.push({
                name: 'These passwords are really similar!',
                group: 2
            });
            var warningNodeIdx = nodes.length-1;
            links.push({
                source: passwordsDict[pair[0]],
                target: warningNodeIdx,
                value: 2
            });
            links.push({
                source: passwordsDict[pair[1]],
                target: warningNodeIdx,
                value: 2
            });
        }
        return {
            nodes: nodes,
            links: links
        };
    }

    function detectSimilarPasswords(loginsTable) {
        var passwordsChecked = {};
        var similarPasswordPairs = [];

        for (var password1 in loginsTable) {
            for (var password2 in loginsTable) {
                if (password1 == password2)
                    continue;
                if (passwordsChecked[password2])
                    continue;

                if (passwordSimilarityCheck(password1,password2))
                    similarPasswordPairs.push([password1,password2]);
            }
            passwordsChecked[password1] = true;
        }
        return similarPasswordPairs;
    }

    function passwordSimilarityCheck(password1,password2) {
        return levenshtein(password1,password2) < Math.max(password1.length,password2.length)/2;
    }

    function levenshtein(str1, str2) {
        var l1 = str1.length, l2 = str2.length;
        if (Math.min(l1, l2) === 0) {
            return Math.max(l1, l2);
        }
        var i = 0, j = 0, d = [];
        for (i = 0 ; i <= l1 ; i++) {
            d[i] = [];
            d[i][0] = i;
        }
        for (j = 0 ; j <= l2 ; j++) {
            d[0][j] = j;
        }
        for (i = 1 ; i <= l1 ; i++) {
            for (j = 1 ; j <= l2 ; j++) {
                d[i][j] = Math.min(
                    d[i - 1][j] + 1,
                    d[i][j - 1] + 1,
                    d[i - 1][j - 1] + (str1.charAt(i - 1) === str2.charAt(j - 1) ? 0 : 1)
                );
            }
        }
        return d[l1][l2];
    }

    function Visualizer() {
        if ( !(this instanceof arguments.callee) )
            throw Error("Constructor called as a function");
    };

    window.Visualizer = Visualizer;

    Visualizer.prototype = {
        'setup': setup,
        'start': start,
    };

})( jQuery, window, document );
