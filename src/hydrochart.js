(function(window, $, d3) {
    'use strict';

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
    var BAR_WIDTH = 30;
    var BAR_GAP_WIDTH = 5;
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
        
        // Compute the size of the svg        
        if(isNullOrUndefine(option.size)) {
            var rect = element.node().getBoundingClientRect();
            drawArgs.size = {
                width: rect.width,
                height: rect.height
            };
        } else {
            drawArgs.size = option.size;
        }   

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
        	endTime: null
        }

        function preprocess(data) {
            if (isNullOrUndefine(data)) {
                console.warn("Input data is null or undfined.");
                return null;
            }
            raw_data = data;
            proc_data = [];

            for(var i = 0; i < data.length; i++) {
            	var value = data[i];
            	var points = data[i].points;

	            for(var j = points.length - 1; j >= 0; j--) {
	            	var point = points[j];

                	var d = {	
                		id: value.id,
                		text: value.name,
                		time: time_format.parse(point.time),
                		value: point.value
                	};

                	if(j == points.length - 1) {
                		d.next_time = d.time;
                	} else {
                		d.next_time = proc_data[0].time;	
                	}

                	console.log(d);
                	proc_data.unshift(d);

                	if(describe.startTime === null || d.time <= describe.startTime) {
                		describe.startTime = d.time;
                	}
                	if(describe.endTime === null || d.time >= describe.endTime) {
                		describe.endTime = d.time;
                	}
	            }
            }
        }


        function beginDraw() {            
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
		                .domain(d3.map(proc_data, function (d) { return d.text }).keys())
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
        	svg.selectAll('.rect')
        	   .data(proc_data)
        	   .enter()
        	   .append('rect')
               .attr('class', function (d, i) {
                   return d.value >= 1 ? CLASS_OPEN_STATE : CLASS_CLOSE_STATE;
               })
               .attr('x', function (d, i) {
                   return xScale(d.time) + option.padding.left;
               })
               .attr('y', function (d, i) {
                   return yScale(d.text) + option.padding.top + (BAR_WIDTH / 2);
               })
               .attr('width', function (d, i) {
                   return xScale(d.next_time) - xScale(d.time);
               })
               .attr('height', function (d, i) {
                   return BAR_WIDTH;
               });

        }

        function endDraw() {

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