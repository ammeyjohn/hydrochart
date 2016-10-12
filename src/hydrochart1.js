function Hydrochart(options) {
    var margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 50
        },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var parseTime = d3.timeParse("%d-%b-%y");

    var zoom = d3.zoom()
        .on("zoom", zoomed);

    var x = d3.scaleTime()
        .range([0, width]);

    var y = d3.scaleLinear()
        .range([height, 0]);

    var xAxis = d3.axisBottom(x)
        .ticks(d3.timeMonth.every(2))
        .tickFormat(d3.timeFormat('%m月'));

    var transform = null;

    var svg = d3.select(".chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        //.call(zoom);

    //var series = new Line(x, y, svg);
    var series = new Bar(x, y, height, width);

    // svg.append("rect")
    //     .attr("width", width)
    //     .attr("height", height);

    // svg.append("clipPath")
    //     .attr("id", "clip")
    //     .append("rect")
    //     .attr("x", 0)
    //     .attr("y", 0)
    //     .attr("width", width)
    //     .attr("height", height);

    var gX = null;
    var path = null;

    d3.tsv("example/data.tsv", type, function(error, data) {
        if (error) throw error;

        x.domain(d3.extent(data, function(d) {
            return d.date;
        }));
        y.domain(d3.extent(data, function(d) {
            return d.close;
        }));

        gX = svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y));

        var idx = 0;
        var d = []

        function run() {
            setTimeout(function() {
                d.push(data[(idx++)]);
                series.draw(svg, d);
                run();
            }, 1000);
        }
        run();

        //series.draw(svg, data);
    });

    function zoomed() {
        var transform = d3.event.transform;
        var xNewScale = transform.rescaleX(x);
        xAxis.scale(xNewScale);
        gX.call(xAxis);

        line.x(function(d) {
            return transform.applyX(x(d.date));
        });
        path.attr("d", line);
    }

    function type(d) {
        d.date = parseTime(d.date);
        d.close = +d.close;
        return d;
    }
}

function Line(x, y, options) {
    var line = d3.line()
        .x(function(d) {
            return x(d.date);
        })
        .y(function(d) {
            return y(d.close);
        });

    this.draw = function(svg, data) {
        svg.append("g")
            .append("path")
            .attr("clip-path", "url(#clip)")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);
    }
}

function Bar(x, y, height, width) {

    this.draw = function(svg, data) {
        svg.selectAll(".bar")
            .exit()
            .remove();

        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) {
                return x(d.date);
            })
            .attr("y", function(d) {
                return y(d.close);
            })
            .attr("height", function(d) {
                return height - y(d.close);
            })
            .attr("width", function(d) {
                var w = width / data.length;
                return w < 1 ? 1 : w;
            });
    }
}