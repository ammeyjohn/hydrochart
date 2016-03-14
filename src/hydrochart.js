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
        
        this.chart = chart;

        // Compute the size of this draw area
        this.size = option.size;
    }

    DrawArea.prototype.draw = function(){
        this.svg = this.chart
                       .element
                       .append('svg')
                       .attr('width', this.size.width)
                       .attr('height', this.size.height);        
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