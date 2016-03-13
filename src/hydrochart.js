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

    var HydroChart = function(ele, option) {
        this.version = '1.0';

        // Get the chart container
        if (isNullOrUndefine(ele)) {
            this.element = d3.select('body');
        } else {
            if (isString(ele)) {
                this.element = d3.select(ele);
            } else {
                this.element = ele;
            }
        }

        // Get the chart option
        this.option = $.extend({}, option, default_option);
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