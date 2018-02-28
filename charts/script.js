var movingAvg2 = function(arr1, arr2, win) {
    if (arr1.length != arr2.length) {
        return [];
    }
    var res = [];
    for (var i = 0; i < arr1.length; i++) {
        var sum1 = 0;
        var sum2 = 0;
        for (var j = Math.max(0, i - win); j < i; j++) {
            sum1 += arr1[j];
            sum2 += arr2[j];
        }
        res.push(sum1 / sum2 * 100);
    }
    return res;
}

var ctx_count_percent = document.getElementById('chart_count_percent').getContext('2d');
var ctx_count = document.getElementById('chart_count').getContext('2d');
var ctx_size_percent = document.getElementById('chart_size_percent').getContext('2d');
var ctx_size = document.getElementById('chart_size').getContext('2d');

// global settings:

Chart.defaults.global.animation = false;
Chart.defaults.global.elements.line.tension = 0;

var chart_count_percent = new Chart(ctx_count_percent, {
    type: 'line',
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    callback: function(value, index, values) { return value.toFixed(2) + '%'; },
                    beginAtZero: true
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
                    callback: function(value, index, values) { return value.toFixed(2) + '%'; },
                    beginAtZero: true
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
    fetch('http://eris.gk2.sk/data.json').then(function(response) {
        return response.json();
    }).then(function(blockData) {
        blockData = blockData.sort(function(a, b) { return a.height - b.height;}).slice(-period);

        if (period > blockData.length) {
            period = 0;
        }

        var initial_series = {
            labels: [],
            segwit_count: [],
            non_segwit_count: [],
            total_count: [],
            percent: [],
            witness_size: [],
            block_size: [],
            block_weight: [],
            size_percent: [],
            size_segwit: [],
            size_total: [],
        };

        var series = blockData.reduce(function(all_series, item) {
            all_series.labels.push(item.height)
            all_series.segwit_count.push(item.txsegwit);
            all_series.non_segwit_count.push(item.txtotal - item.txsegwit);
            all_series.total_count.push(item.txtotal);
            all_series.percent.push(100 * item.txsegwit / item.txtotal);
            all_series.witness_size.push(item.size - item.strippedsize);
            all_series.block_size.push(item.size);
            all_series.block_weight.push(item.weight);
            all_series.size_percent.push(100 * (item.size - item.strippedsize) / (item.size));
            all_series.size_segwit.push(item.size - item.strippedsize);
            all_series.size_total.push(item.size);
            return all_series;
        }, initial_series);


        var data_count = {
            labels: series.labels,
            datasets: [{
                label: 'SegWit',
                data: series.segwit_count,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }, {
                label: 'Non-SegWit',
                data: series.non_segwit_count,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        };

        var data_count_percent = {
            labels: series.labels,
            datasets: [{
                label: '144-block moving average',
                data: movingAvg2(series.segwit_count, series.total_count, 144),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }, {
                hidden: true,
                label: 'value per block',
                data: series.percent,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        };

        var data_size = {
            labels: series.labels,
            datasets: [{
                label: 'witness size',
                data: series.witness_size,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }, {
                label: 'block size',
                data: series.block_size,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }, {
                hidden: true,
                label: 'block weight',
                data: series.block_weight,
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1,
            }]
        };

        var data_size_percent = {
            labels: series.labels,
            datasets: [{
                label: '144-block moving average',
                data: movingAvg2(series.size_segwit, series.size_total, 144),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }, {
                hidden: true,
                label: 'value per block',
                data: series.size_percent,
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

