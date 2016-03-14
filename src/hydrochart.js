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
        },
        size: {
            width: 800,
            height: 600
        }
    }

    // Defines the hydochart type
    var HydroChart = function(ele, option) {
        this.version = '1.0';

        // Defines the alias name of this pointer.
        var chart = this;

        // Get the chart container
        if (isNullOrUndefine(ele)) {
            chart.element = d3.select('body');
        } else {
            if (isString(ele)) {
                chart.element = d3.select(ele);
            } else {
                chart.element = ele;
            }
        }

        // Get the chart option
        chart.option = $.extend({}, option, default_option);

        var size = chart.option.size;
        if (isNullOrUndefine(size)) {
            var rect = chart.element.node().getBoundingClientRect()
            size.width = rect.width;
            size.height = rect.height;
        }

        // Create draw area object.
        var area_option = {
            size: {
                width: size.width - chart.option.padding.left - chart.option.padding.right,
                height: size.height - chart.option.padding.top - chart.option.padding.bottom,
            }
        }
        chart.area = new DrawArea(chart, area_option);

        //// Defines instance methods ////

        chart.draw = function() {
            chart.area.draw(chart);
        }
    }

    // Defines the area type to draw shapes on.
    var DrawArea = function(chart, option) {

        // Defines the alias name of this pointer.
        var self = this;

    	// To store the input arguments.
        self.chart = chart;
        self.option = option;

        // Defines the curve array to store all curves in this area.
        self.curves = [];
        self.curves.push(createCurve('PumpCurve', null));

        // Compute the size of this draw area
        self.size = option.size;

        // To Draw this area
        self.draw = function() {
            self.svg = self.chart
                .element
                .append('svg')
                .attr('width', self.size.width)
                .attr('height', self.size.height);

            $.each(self.curves, function(idx, curve){
            	curve.draw();
            });
        }

        //// Defines the private methods ////

        // To create curve by curve type
        function createCurve(curveType, option) {
        	var curve = null;
        	switch(curveType) {
        		case 'PumpCurve':
        			return new PumpCurve(self.chart, self, option);
        		default:
        			console.warn('The curve type "' + curveType + '" has not been supported!');

        	}
        	return curve
        }
    }

    // Defines the base class of different curve types.
    var Curve = function(chart, area, option) {

    	// Defines the alias name of this pointer.
    	var self = this;

    	// To store the input arguments.
    	self.chart = chart;
    	self.area = area;
    	self.option = option;

    	//// Defines all virtual functions should be oerrieded.

    	// Defines the draw method to render the curve.
    	self.draw = function(data) {
    		console.log('Curve.draw begin');
    		var processed = self.preprocess(data);
    		self.drawSeries();
    		self.drawAxis();
    		console.log('Curve.draw end');
    	}

    	self.preprocess = function(data) {
    		console.log('Curve.preprocess');
    	}

    	self.drawAxis = function() {
    		console.log('Curve.drawAxis');
    	}

    	self.drawSeries = function() {
    		console.log('Curve.drawSeries');
    	}
    }

    // Defines PumpCurve type inherit from Curve
    var PumpCurve = function(chart, area, option) { 
    	Curve.call(this, chart, area, option);

    	this.preprocess = function(data) {
    		console.log('PumpCurve.preprocess');
    	}

    	this.drawAxis = function() {
    		console.log('PumpCurve.drawAxis');
    	}

    	this.drawSeries = function() {
    		console.log('PumpCurve.drawSeries');
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