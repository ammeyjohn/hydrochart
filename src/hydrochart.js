/**
 * [Hydrochart description]
 * @param {[type]} options [description]
 */
function Hydrochart(options) {

    /* 定义常量、工具变量 */
    var parseDate = d3.timeParse("%d-%b-%y");

    /* 定义内部变量、实例变量和全局变量 */

    // 获取用于绘制曲线控件的容器元素
    var ele = options.container;
    if (!ele) {
        ele = 'body';
    }
    var container = d3.select(ele);

    // 定义曲线图边界
    var margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 50
        },
        size = {
            width: parseInt(container.style('width').replace('px')),
            height: parseInt(container.style('height').replace('px'))
        },
        drawSize = {
            width: size.width - margin.left - margin.right,
            height: size.height - margin.top - margin.bottom
        }

    var xScale = d3.scaleTime().range([0, drawSize.width]);
    var yScale = d3.scaleLinear().range([drawSize.height, 0]);

    var line = d3.line()
        .x(function(d) {
            return xScale(d.date);
        })
        .y(function(d) {
            return yScale(d.value);
        });

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    var row = function(d) {
        d.date = parseDate(d.date);
        d.value = +d.value;
        return d;
    }

    this.draw = function(url) {

        var svg = container.append("svg")
            .attr("width", size.width)
            .attr("height", size.height)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + drawSize.height + ")")
            .call(xAxis);

        svg.append("g")
	        .attr("class", "axis axis--y")
	        .call(yAxis);

        d3.tsv(url, row, function(error, data) {

            xScale.domain(d3.extent(data, function(d) {
                return d.date;
            }));
            yScale.domain(d3.extent(data, function(d) {
                return d.value;
            }));

            svg.append("path")
                .datum(data)
                .attr("class", "line")
                .attr("d", line);

        });

    }
}