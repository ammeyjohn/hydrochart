$(function() {

    var chart = new Hydrochart({
        container: '.chart',

        series: [{
            type: 'line',
            data: {
            	ajax: {
            		type: 'tsv',
            		url: 'example/data1.tsv'
            	}
            }
        }]
    });
    chart.draw();
})