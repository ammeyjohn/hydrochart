(function(window, $, d3) {
    'use strict';

    // Defines the default chart option, 
    // this will be overrided by option in parameter.
    var default_option = {
        padding: {
            top: 20,
            left: 10,
            bottom: 20,
            right: 10
        }
    }

    // Defines the time format to convert string to datetime.
    var time_format = d3.time.format('%Y-%m-%d %H:%M:%S');

    // Defines the hydochart type
    var HydroChart = function(ele, option) {
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
            yScale = null;

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
        option = $.extend({}, option, default_option);
        
        // Compute the size of the svg        
        if(isNullOrUndefine(option.size)) {
            var rect = element.node().getBoundingClientRect();
            drawArgs.size = {
                width: rect.width,
                height: rect.height
            };
        }        

        //// Defines all instance methods ////

        this.draw = function(data) {
            proc_data = preprocess(data);
            if (!isNullOrUndefine(proc_data)) {
                beginDraw();
                drawCurve();
                drawAxis();
                endDraw();
            }
        }

        //// Defines all private methods ////

        function preprocess(data) {
            if (isNullOrUndefine(data)) {
                console.warn("Input data is null or undfined.");
                return null;
            }
            raw_data = data;
            $.each(data, function(i, value) {
                // Format all times
                $.each(value.points, function(j, point) {
                    point.formated_time = time_format.parse(point.time);
                });
            });
            return data;
        }

        function beginDraw() {            
            svg = element
                    .append('svg')
                    .attr('width', drawArgs.size.width)
                    .attr('height', drawArgs.size.height);
        }

        function drawAxis() {

        }

        function drawCurve() {

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