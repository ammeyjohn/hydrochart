$(function() {

    var chart = new Hydrochart({
        container: '.chart'
    });    
    chart.draw('example/data.tsv');
})