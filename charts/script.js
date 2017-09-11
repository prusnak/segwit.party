var myMovingAverage = function(arr, win) {
    var filtered = medianFilter(arr, 5);
    var prefill = new Array(win);
    prefill.fill(0);
    filtered = prefill.concat(filtered);
    averaged = movingAverage(filtered, win);
    return averaged.slice(win);
}

var ctx_count_percent = document.getElementById('chart_count_percent').getContext('2d');
var ctx_count = document.getElementById('chart_count').getContext('2d');
var ctx_size_percent = document.getElementById('chart_size_percent').getContext('2d');
var ctx_size = document.getElementById('chart_size').getContext('2d');

var chart_count_percent = new Chart(ctx_count_percent, {
    type: 'line',
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    callback: function(value, index, values) { return value.toPrecision(2) + '%'; }
                }
            }]
        },
        tooltips: {
            callbacks: {
                label: function(tooltipItem, data) { return tooltipItem.yLabel.toFixed(2) + '%'; }
            }
        }
    }
});

var chart_count = new Chart(ctx_count, {
    type: 'line',
});

var chart_size_percent = new Chart(ctx_size_percent, {
    type: 'line',
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    callback: function(value, index, values) { return value.toPrecision(2) + '%'; }
                }
            }]
        },
        tooltips: {
            callbacks: {
                label: function(tooltipItem, data) { return tooltipItem.yLabel.toFixed(2) + '%'; }
            }
        }
    }
});

var chart_size = new Chart(ctx_size, {
    type: 'line',
});

var drawCharts = function(period) {

    fetch('data.json').then(function(response) {
        return response.json();
    }).then(function(blockData) {
        blockData = blockData.sort(function(a, b) { return a.height - b.height;});

        if (period > blockData.length) {
            period = 0;
        }

        var data_count = {
            labels: blockData.map(function(item){ return item.height; }).slice(-period),
            datasets: [{
                label: 'SegWit',
                data: blockData.map(function(item){ return item.txsegwit; }).slice(-period),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }, {
                label: 'Non-SegWit',
                data: blockData.map(function(item){ return item.txtotal - item.txsegwit; }).slice(-period),
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        };

        var count_percent = blockData.map(function(item){ return item.txsegwit <= 1 ? 0 : 100 * (item.txsegwit) / (item.txtotal); });

        var data_count_percent = {
            labels: blockData.map(function(item){ return item.height; }).slice(-period),
            datasets: [{
                label: '144-block moving average',
                data: myMovingAverage(count_percent, 144).slice(-period),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }, {
                hidden: true,
                label: 'value per block',
                data: count_percent.slice(-period),
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        };

        var data_size = {
            labels: blockData.map(function(item){ return item.height; }).slice(-period),
            datasets: [{
                label: 'witness size',
                data: blockData.map(function(item){ return item.size - item.strippedsize; }).slice(-period),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }, {
                label: 'block size',
                data: blockData.map(function(item){ return item.size; }).slice(-period),
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }, {
                hidden: true,
                label: 'block weight',
                data: blockData.map(function(item){ return item.weight; }).slice(-period),
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1,
            }]
        };

        var size_percent = blockData.map(function(item){ return 100 * (item.size - item.strippedsize) / (item.size); });

        var data_size_percent = {
            labels: blockData.map(function(item){ return item.height; }).slice(-period),
            datasets: [{
                label: '144-block moving average',
                data: myMovingAverage(size_percent, 144).slice(-period),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }, {
                hidden: true,
                label: 'value per block',
                data: size_percent.slice(-period),
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        };

        chart_count_percent.data = data_count_percent;
        chart_count.data = data_count;
        chart_size_percent.data = data_size_percent;
        chart_size.data = data_size;

        chart_count_percent.update();
        chart_count.update();
        chart_size_percent.update();
        chart_size.update();
    });
}
