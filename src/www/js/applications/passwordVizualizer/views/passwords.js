define([
    'underscore',
    'backbone',
    'sandbox',
    '../utils',
    'd3_layout',
], function(_, Backbone, sandbox, getLoginsJSON, d3) {

    var PasswordsView = Backbone.View.extend({

        initialize : function () {
            this.fill = d3.scale.category10();
            /*--- binding ---*/
            this.collection.on('change', this.render, this);
            this.collection.on('remove', this.render, this);
            this.collection.on('add', this.render, this);
            this.collection.on('reset', this.render, this);
            /*---------------*/
        },

        render : function () {
            var vis, loginData, fill;
            this.$el.html('');

            fill = this.fill;

            vis = d3.select(this.el)
                        .append("svg:svg")
                        .attr("width", '100%')
                        .attr("height", 500);
            loginData = getLoginsJSON(this._parsePasswords());

            var force = d3.layout.force()
            .charge(-100)
            .nodes(loginData.nodes)
            .links(loginData.links)
            .size([900, 500])
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

            return this;
        },

        _parsePasswords : function () {
            var json,
                pwdDict = {};

            json = this.collection.toJSON();
            _.each(json, function(val, key){
                if (_.has(pwdDict, val.pwd)){
                    pwdDict[val.pwd].push(val.site);
                }else{
                    pwdDict[val.pwd] = [val.site];
                }
            });
            return pwdDict;
        },

        destroy : function () {
            this.unbind();
            this.$el.html('');
        },
    });

    return PasswordsView;
});
