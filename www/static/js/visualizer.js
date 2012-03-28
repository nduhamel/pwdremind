var loginData;
var vis;

var fill = d3.scale.category10();

var w,h;

function vizualizerInit(data, height, width, chart) {
    w = width;
    h = height;

    vis = d3.select(chart)
        .append("svg:svg")
        .attr("width", w)
        .attr("height", h);

    loginData = getLoginsJSON(data);
    startViz();
}

function startViz() {
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
        delayOut: 500,
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
