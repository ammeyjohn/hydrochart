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
        },
        mode: 'Day'
    }

    // Defines consts
    var MODE_DAY = 'Day';

    // Defines all constant values
    var MINUTES_PER_DAY = 1440;
    var BAR_HEIGHT = 22;
    var BAR_STROKE_WIDTH = 1;
    var BAR_GAP_WIDTH = 10;
    var AXIS_WIDTH = 20;
    var CLASS_OPEN_STATE = 'rect open';
    var CLASS_CLOSE_STATE = 'rect close';
    var CLASS_FAULT_STATE = 'rect fault';
    var TEXT_WIDTH = 12;
    var TEXT_HEIGHT = 14;

    // Defines the time format to convert string to datetime.
    var time_format = d3.time.format('%Y-%m-%d %H:%M:%S');

    // Defines the hydochart type
    var HydroChart = function(ele, opt) {
        this.version = '1.0';

        var element = null, // Container element
            option = null, // Options             
            timelines = [], // The processed data
            params = {}; // The parameters for chart drawing

        var svg = null,
            xScale = null,
            yScale = null,
            xAxis = null,
            yAxis = null;

        var hoverLine = null,
            hoverText = null,
            tooltips = [];

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
            barNames: null,
            barCount: 0
        }

        function preprocess(data) {
            if (isNullOrUndefine(data)) {
                console.warn("Input data is null or undfined.");
                return null;
            }

            // Process the raw data.
            for (var i in data) {
                // Clone and protected the raw data.
                var line = $.extend({}, data[i]);
                timelines.push(line);

                // Try to convert time string to Date object.
                for (var i in line.values) {
                    var v = line.values[i];
                    if (isString(v.time)) {
                        v.time = time_format.parse(v.time);
                    }
                    v.label = formatValue(parseInt(v.value.toFixed(0)), line.unit);
                }

                // Sort all values by time
                var sorted_values = line.values.sort(function(a, b) {
                    return a.time - b.time;
                });

                // Merges the points with same value.
                var merged_values = [sorted_values[0]];
                for (var i = 1, j = sorted_values.length; i < j; i++) {
                    if (sorted_values[i].value !== sorted_values[i - 1].value) {
                        merged_values.push(sorted_values[i]);
                    }
                }

                for (var i = 0, j = merged_values.length; i < j; i++) {
                    var v = merged_values[i];

                    // Make relation between neibour values  
                    if (i > 0) {
                        v.prev = merged_values[i - 1];
                    }
                    if (i < j - 1) {
                        v.next = merged_values[i + 1];
                    }
                }

                // Day Mode
                // The time of first point should 0:00 and 
                // The time of last point should 0:00 in next day.
                if (option.mode == MODE_DAY) {
                    var first = getFirst(merged_values);
                    if (first.time.getHours() !== 0 || first.time.getMinutes() !== 0) {
                        first.time.setHours(0);
                        first.time.setMinutes(0);
                    }

                    var last = getLast(merged_values);
                    if (last.time.getHours() !== 0 || last.time.getMinutes() !== 0) {
                        // TODO: to process the timeline if the last point is not 23:59 or 0:00 in next day
                    }
                }

                // Rename points property
                line.points = merged_values;
                delete line.values;

                for (var i in line.points) {
                    var point = line.points[i];
                    if (describe.startTime === null || point.time <= describe.startTime) {
                        describe.startTime = point.time;
                    }
                    if (describe.endTime === null || point.time >= describe.endTime) {
                        describe.endTime = point.time;
                    }
                }
            }

            // To statistic the values
            describe.barCount = timelines.length;
            describe.barNames = d3.map(timelines, function(d) {
                return d.name
            }).keys();
        }

        function beginDraw() {

            // Compute the size of the svg        
            if (isNullOrUndefine(option.size)) {
                var rect = element.node().getBoundingClientRect();
                params.size = {
                    width: rect.width,
                    height: rect.height
                };

                // Calculate the chart height if not be set.
                var chartHeight = option.padding.top + option.padding.bottom +
                    describe.barCount * (BAR_HEIGHT + BAR_GAP_WIDTH) +
                    AXIS_WIDTH;
                params.size.height = chartHeight;
            } else {
                params.size = option.size;
            }

            svg = element
                .append('svg')
                .attr('width', params.size.width)
                .attr('height', params.size.height);

            var xScaleWidth = params.size.width - option.padding.left - option.padding.right;
            xScale = d3.time.scale()
                .domain([describe.startTime, describe.endTime])
                .nice(d3.time.hour)
                .range([0, xScaleWidth]);

            var yScaleHeight = params.size.height - option.padding.top - option.padding.bottom;
            yScale = d3.scale.ordinal()
                .domain(describe.barNames)
                .rangeRoundBands([0, yScaleHeight]);

        }

        function drawAxis() {
            xAxis = d3.svg.axis()
                .scale(xScale)
                .tickFormat(d3.time.format('%H:%M'))
                .ticks(24)
                .orient('bottom');
            svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + option.padding.left + ',' + (params.size.height - option.padding.bottom) + ')')
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
            //drawCurveText();
        }

        function drawCurveBar() {
            for (var i in timelines) {
                var line = timelines[i];

                // Create svg group for each line
                var top = yScale(line.name) + option.padding.top + (BAR_HEIGHT / 2) - BAR_STROKE_WIDTH - BAR_STROKE_WIDTH;
                var g = svg.append('g')
                    .attr('transform', 'translate(' + option.padding.left + ',' + top + ')');

                g.selectAll('.rect')
                    .data(line.points)
                    .enter()
                    .append('rect')
                    .attr('class', function(d, i) {
                        return d.value >= 1 ? CLASS_OPEN_STATE : CLASS_CLOSE_STATE;
                    })
                    .attr('x', function(d, i) {
                        d.x = xScale(d.time);
                        return d.x;
                    })
                    .attr('y', 0)
                    .attr('width', function(d, i) {
                        d.width = 0;
                        if (d.next) {
                            d.width = xScale(d.next.time) - xScale(d.time);
                        }
                        return d.width;
                    })
                    .attr('height', function(d, i) {
                        d.height = BAR_HEIGHT;
                        return BAR_HEIGHT;
                    });

                drawCurveText(g, line);
            }
        }

        function drawCurveText(g, line) {
            g.selectAll('.label')
                .data(line.points)
                .enter()
                .append('text')
                .filter(function(d) {
                    return d.width > 15 && d.time !== d.next.time;
                })
                .attr('class', 'label')
                .text(function(d) {
                    return d.label;
                })
                .attr('x', function(d, i) {
                    return xScale(d.time) + 5;
                })
                .attr('y', function(d, i) {
                    return TEXT_HEIGHT;
                });
        }

        function endDraw() {

            createHovers();
            /*
            createTooltips();
            */

            // Bind mouse events on svg element;            
            svg.on('mousemove', function() {
                var pos = d3.mouse(this);

                // Show or hide the hover line and move it.
                if (inBox(pos[0], pos[1])) {
                    showHovers(pos);
                    //showTooltips(pos);
                } else {
                    hideHovers(pos);
                    //hideTooltips(pos);
                }
            });
        }

        function createHovers() {
            // Create the mouse pointer line
            hoverLine = svg.append("line")
                .attr('class', 'hover_line')
                .classed("hide", false)
                .attr("x1", -1)
                .attr("x2", -1)
                .attr("y1", option.padding.top)
                .attr("y2", params.size.height - option.padding.bottom);

            // Create the hover text.
            /*
            hoverText = svg.append('text')
                .attr('class', 'hover_text')
                .text('00:00')
                .style('opacity', 0)
                .attr('x', -1)
                .attr('y', option.padding.top + 8);
            */
        }

        function showHovers(pos) {
            var mouseX = pos[0];
            hoverLine.classed("hide", false)
                .attr("x1", mouseX)
                .attr("x2", mouseX)

            /*
            var time = xScale.invert(mouseX - option.padding.left);
            var text = time.toLocaleTimeString('zh-CN', {
                hour12: false
            }).substr(0, 5);
            hoverText.style('opacity', 1)
                .text(text)
                .attr("x", mouseX - 31);
            */
        }

        function hideHovers(pos) {
            hoverLine.classed("hide", true)
                .attr("x1", -1)
                .attr("x2", -1)
            /*
            hoverText.style('opacity', 0)
                .attr("x", -1);            
            */
        }

        function createTooltips() {
            var keys = d3.map(proc_data, function(d) {
                return d.text
            }).keys();
            $.each(keys, function(i, key) {
                var y = yScale(key) + option.padding.top + TEXT_WIDTH / 2;
                var tooltip = svg.append('text')
                    .attr('class', 'tooltip')
                    .text('00:00')
                    .style('opacity', 0)
                    .attr('x', -1)
                    .attr('y', y);
                tooltips.push(tooltip);
            });
        }

        function showTooltips(pos) {
            var time = xScale.invert(pos[0] - option.padding.left);
            var searcher = d3.bisector(function(d) {
                return d.time;
            }).left;
            for (var i = 0, j = tooltips.length; i < j; i++) {

                var idx = searcher(proc_data, time);
                var d = proc_data[idx];
                var text = d.text + ' ' + formatTime(time) + ' ' + formatValue(d.value, d.unit);

                var tooltip = tooltips[i]
                tooltip.style('opacity', 1)
                    .text(text)
                    .attr('class', 'tooltip')
                    .attr('x', pos[0] + 5);
            }
        }

        function hideTooltips(pos) {
            for (var i = 0, j = tooltips.length; i < j; i++) {
                tooltips[i].style('opacity', 0)
                    .attr('x', -1);
            }
        }

        // Chech whether the given coordination in available bound.
        function inBox(x, y) {
            return x >= option.padding.left &&
                x <= params.size.width - option.padding.right &&
                y >= option.padding.top &&
                y <= params.size.height - option.padding.bottom;
        }

        function formatValue(value, unit) {
            var text = '';
            if (value === 0) text = '关';
            else if (value === 1) text = '开';
            else text = value.toString() + ' ' + unit;
            return text;
        }
    }


    //// Defines the helper functions ////

    var formatTime = function(time) {
        var dateStr = time.getFullYear() + '-' + time.getMonth() + '-' + time.getDate();
        var timeStr = time.toLocaleTimeString('zh-CN', {
            hour12: false
        }).substr(0, 5);
        return dateStr + ' ' + timeStr;
    }

    // Check whether the obj is null or undfined.
    var isNullOrUndefine = function(obj) {
        return obj === undefined || obj === null;
    }

    // Check whether the type of the obj is string.
    var isString = function(obj) {
        return isNullOrUndefine(obj) ? false : typeof obj === 'string';
    }

    var getFirst = function(values) {
        return values[0];
    }

    var getLast = function(values) {
        return values[values.length - 1];
    }

    //// Exports HydroChart Component ////
    window.HydroChart = HydroChart;

})(window, jQuery, d3)