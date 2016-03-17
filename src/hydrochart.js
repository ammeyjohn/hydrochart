(function(window, $, d3) {
    'use strict';

    // Give the alise name of this pointer.
    var self = this;

    // Defines the default chart option, 
    // this will be overrided by option in parameter.
    var default_option = {
        padding: {
            top: 20,
            left: 25,
            bottom: 30,
            right: 20
        }
    }

    // Defines all constant values
    var MINUTES_PER_DAY = 1440;
    var BAR_WIDTH = 22;
    var BAR_GAP_WIDTH = 5;
    var AXIS_WIDTH = 20;
    var CLASS_OPEN_STATE = 'rect open';
    var CLASS_CLOSE_STATE = 'rect close';

    // Defines the time format to convert string to datetime.
    var time_format = d3.time.format('%Y-%m-%d %H:%M:%S');

    // Defines the hydochart type
    var HydroChart = function(ele, opt) {
        this.version = '1.0';

        var element = null, // Container element
            option = null, // Options            
            raw_data = null, // The raw data
            proc_data = null, // The processed data
            drawArgs = {}; // The arguments for chart drawing

        var svg = null,
            xScale = null,
            yScale = null,
            xAxis = null,
            yAxis = null;

        var hoverLine = null;

        // Get the chart container
        if (isNullOrUndefine(ele)) {
            element = d3.select('body');
        } else {
            if (isString(ele)) {
                element = d3.select(ele);
            } else {
                element = ele;
            }
        }

        // Get the chart option
        option = $.extend({}, default_option, opt);

        //// Defines all instance methods ////

        this.draw = function(data) {
            preprocess(data);
            beginDraw();
            drawCurve();
            drawAxis();
            endDraw();
        }

        //// Defines all private methods ////

        var describe = {
            startTime: null,
            endTime: null,
            barCount: 0
        }

        function preprocess(data) {
            if (isNullOrUndefine(data)) {
                console.warn("Input data is null or undfined.");
                return null;
            }
            raw_data = data;
            proc_data = [];

            // Statistics the bar count
            describe.barCount = data.length;

            for (var i = 0; i < data.length; i++) {
                var value = data[i];
                var points = data[i].points;

                for (var j = points.length - 1; j >= 0; j--) {
                    var point = points[j];

                    var d = {
                        id: value.id,
                        text: value.name,
                        time: time_format.parse(point.time),
                        value: point.value
                    };

                    if (j == points.length - 1) {
                        d.next_time = d.time;
                    } else {
                        d.next_time = proc_data[0].time;
                    }

                    proc_data.unshift(d);

                    if (describe.startTime === null || d.time <= describe.startTime) {
                        describe.startTime = d.time;
                    }
                    if (describe.endTime === null || d.time >= describe.endTime) {
                        describe.endTime = d.time;
                    }
                }
            }
        }

        function beginDraw() {

            // Compute the size of the svg        
            if (isNullOrUndefine(option.size)) {
                var rect = element.node().getBoundingClientRect();
                drawArgs.size = {
                    width: rect.width,
                    height: rect.height
                };

                // Calculate the chart height if not be set.
                var chartHeight = option.padding.top + option.padding.bottom +
                    describe.barCount * (BAR_WIDTH + BAR_GAP_WIDTH) +
                    AXIS_WIDTH;
                drawArgs.size.height = chartHeight;
            } else {
                drawArgs.size = option.size;
            }

            svg = element
                .append('svg')
                .attr('width', drawArgs.size.width)
                .attr('height', drawArgs.size.height);

            var xScaleWidth = drawArgs.size.width - option.padding.left - option.padding.right;
            xScale = d3.time.scale()
                .domain([describe.startTime, describe.endTime])
                .range([0, xScaleWidth]);

            var yScaleHeight = drawArgs.size.height - option.padding.top - option.padding.bottom;
            yScale = d3.scale.ordinal()
                .domain(d3.map(proc_data, function(d) {
                    return d.text
                }).keys())
                .rangeRoundBands([0, yScaleHeight]);

        }

        function drawAxis() {
            xAxis = d3.svg.axis()
                .scale(xScale)
                .tickFormat(d3.time.format('%H:%M'))
                .orient('bottom');
            svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + option.padding.left + ',' + (drawArgs.size.height - option.padding.bottom) + ')')
                .call(xAxis);

            yAxis = d3.svg.axis()
                .scale(yScale)
                .orient('left');
            svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + option.padding.left + ',' + option.padding.top + ')')
                .call(yAxis);
        }

        function drawCurve() {
            drawCurveBar();
            drawCurveText();
        }

        function drawCurveBar() {
            svg.selectAll('.rect')
                .data(proc_data)
                .enter()
                .append('rect')
                .attr('class', function(d, i) {
                    return d.value >= 1 ? CLASS_OPEN_STATE : CLASS_CLOSE_STATE;
                })
                .attr('x', function(d, i) {
                    d.x = xScale(d.time) + option.padding.left;
                    return d.x;
                })
                .attr('y', function(d, i) {
                    d.y = yScale(d.text) + option.padding.top + (BAR_WIDTH / 2) - BAR_GAP_WIDTH;
                    return d.y;
                })
                .attr('width', function(d, i) {
                    d.width = xScale(d.next_time) - xScale(d.time);
                    return d.width;
                })
                .attr('height', function(d, i) {
                    d.height = BAR_WIDTH;
                    return BAR_WIDTH;
                });
        }

        function drawCurveText() {
            svg.selectAll('.label')
                .data(proc_data)
                .enter()
                .append('text')
                .filter(function(d) {
                    return d.width > 15 && d.time !== d.next_time;
                })
                .attr('class', 'label')
                .text(function(d) {
                    d.label_text = '';
                    if (d.value === 0) d.label_text = '关';
                    else if (d.value === 1) d.label_text = '开';
                    else {
                        d.label_text = parseFloat(d.value).toFixed(0).toString();
                        if (d.width > 34) {
                            d.label_text += ' Hz';
                        }
                    }
                    return d.label_text;
                })
                .attr('x', function(d, i) {
                    return xScale(d.time) + option.padding.left + 5;
                })
                .attr('y', function(d, i) {
                    return yScale(d.text) + option.padding.top + (BAR_WIDTH / 2) + 10;
                });
        }

        function endDraw() {

            // Create the mouse pointer line
            hoverLine = svg.append("g")
                .append("line")
                .attr('class', 'index_line')
                .classed("hide", false)
                .attr("x1", -1)
                .attr("x2", -1)
                .attr("y1", option.padding.top)
                .attr("y2", drawArgs.size.height - option.padding.bottom);

            // Bind mouse events on svg element;            
            svg.on('mousemove', function() {
                var pos = d3.mouse(this);
                if (inBox(pos[0], pos[1])) {
                    hoverLine.classed("hide", false)
                             .attr("x1", pos[0])
                             .attr("x2", pos[0])
                } else {
                    hoverLine.classed("hide", true)
                             .attr("x1", -1)
                             .attr("x2", -1)
                }
            });
        }

        // Chech whether the given coordination in available bound.
        var inBox = function(x, y) {
            return x >= option.padding.left &&
                x <= drawArgs.size.width - option.padding.right &&
                y >= option.padding.top &&
                y <= drawArgs.size.height - option.padding.bottom;
        }
    }


    //// Defines the helper functions ////

    // Check whether the obj is null or undfined.
    var isNullOrUndefine = function(obj) {
        return obj === undefined || obj === null;
    }

    // Check whether the type of the obj is string.
    var isString = function(obj) {
        return isNullOrUndefine(obj) ? false : typeof obj === 'string';
    }

    //// Exports HydroChart Component ////
    window.HydroChart = HydroChart;

})(window, jQuery, d3)