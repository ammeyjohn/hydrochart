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

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    var context = {
        xScale: xScale,
        yScale: yScale,
        size: size,
        drawSize: drawSize
    }

    var row = function(d) {
        d.date = parseDate(d.date);
        d.value = +d.value;
        return d;
    }

    var series = null;
    var seriesType = options.series[0].type;
    switch (seriesType) {
        case 'line':
            series = new LineSeries(context, null);
            break;
        case 'bar':
            series = new BarSeries(context, null);
            break;
        case 'area':
            series = new AreaSeries(context, null);
            break;
        default:
            console.warn('Hydrochart::ctor::Unsupported series type: ' + seriesType);
    }

    this.draw = function() {

        var svg = container.append("svg")
            .attr("width", size.width)
            .attr("height", size.height)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // 绘制背景

        // 绘制坐标X轴
        svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + drawSize.height + ")")
            .call(xAxis);

        // 绘制坐标Y轴
        svg.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis);

        // 绘制曲线图形
        var url = options.series[0].data.ajax.url;
        d3.tsv(url, row, function(error, data) {

            xScale.domain(d3.extent(data, function(d) {
                return d.date;
            }));
            yScale.domain(d3.extent(data, function(d) {
                return d.value;
            }));

            if (series == null) {
                console.error('Hydrochart::draw::series object is null.');
            }
            series.draw(data, svg);

        });

    }
}

function Series(context, options) {

    /* 定义内部变量、实例变量和全局变量 */

    this.draw = function(data, svg) {
        console.warn('Series::draw::Series object cannot be drawn.');
    }
}

function LineSeries(context, options) {

    var line = d3.line()
        .x(function(d) {
            return context.xScale(d.date);
        })
        .y(function(d) {
            return context.yScale(d.value);
        });

    this.draw = function(data, svg) {
        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);
    }
}

function AreaSeries(context, options) {

    this.draw = function(data, svg) { 

    }
}

function BarSeries(context, options) {

    this.draw = function(data, svg) {

    }
}