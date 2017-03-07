'use script';
angular
    .module('myApp')
    .component('areaChart', {
        bindings: {
            data: '<'
        },
        controller: Controller,
        template: `<div google-chart chart="$ctrl.chart" style="$ctrl.chart.cssStyle"></div>`
    });

Controller.$inject = ['$q']

function Controller($q) {
    const vm = this;
    const warnOnDaysClose = 30;
    const chartStates = [
        { name: 'actual-planned', color: 'green', line: 'continuos' },
        { name: 'actual-passed', color: 'red', line: 'continuos' },
        { name: 'prognos-planned', color: 'lightgreen', line: 'intermitent' },
        { name: 'prognos-passed', color: 'pink', line: 'intermitent' },
        { name: 'closeToendDate' , color: 'orange', line: 'intermitent'},
        {name: 'contractedMileageLine' , color: 'red',line:'intermitent'}];

    const userData = [
        {
            assumedMileage: 250,
            assumedDate: '20170401',
            contractStart: '20170201',
            contractEnd: '20170407',
            mileage: 200,
            contractMileage: 400
        }];

    let actualValues = [];

    var chartData = {};
    chartData.type = "ComboChart";
    chartData.cssStyle = "height:200px; width:300px;";
    chartData.data = {
        "cols": [
            { id: "month", label: "Month", type: "string" },
            { id: "line1-id", label: "line1", type: "number" },
            { id: "line2-id", label: "line2", type: "number" },
            { id: "line3-id", label: "line3", type: "number" },
            { id: "line4-id", label: "line4", type: "number" }
        ], "rows": []
    };

    Init();

    function Init() {
        $q.resolve(chartData)
            .then(setDates)
            .then(setLineColors)
            .then(setRowsActualData)
            .catch(error => console.info(error));
    }

    function getAssumedData(chart, index) {
        if (index === 1) {
            return userData[0]['mileage'];
        } else if (index === 2) {
            return userData[0]['assumedMileage'];
        } else if (index === 3) {
            return userData[0]['assumedMileage'];
        }
    }

    function getContractedData(index) {
        switch (index) {
            case 0:
                return 0
                break;
            case 1:
                return userData[0]['mileage'];
                break;
            case 3:
                return null;
                break;
        }
    }

    function setLineColors(chart) {
        chart.options.colors = [
            getChartState('actual', userData[0]['mileage']).color,
            getChartState('prognos', userData[0]['assumedMileage']).color,
            chartStates.find(x => x.name === 'contractedMileageLine').color,
            chartStates.find(x => x.name === 'closeToendDate').color];
        return $q.resolve(chart);
    }

    function setDates(chart) {
        const startDate = moment(userData[0]['contractStart']);
        const endDate = moment(userData[0]['contractEnd']);
        const todaysDate = moment();
        const assumedDate = moment(userData[0]['assumedDate']);

        if (todaysDate.diff(endDate) > 0) {
            /*if (endDate.diff(todaysDate, 'days') <= warnOnDaysClose) {
          chart.splice(3, 0, endDate.subtract(warnOnDaysClose, 'days').format('LL'));
      }*/
            actualValues = [startDate.format('LL'), endDate.format("LL"), todaysDate.format('MMM')]
        } else if (assumedDate > endDate) {
            actualValues = [startDate.format('LL'), todaysDate.format('MMM'), endDate.format("LL"), assumedDate.format('LL')]
        } else {
            actualValues = [startDate.format('LL'), todaysDate.format('MMM'), assumedDate.format('LL'), endDate.format('LL')];
        }
        return $q.resolve(chart);
    }

    function getChartState(state = 'prognos', mileageRef) {
        const roofMileage = userData[0]['contractMileage'];
        const param = mileageRef < roofMileage ? `${state}-planned` : `${state}-passed`;
        const resultState = chartStates.find(x => x.name === param);
        return resultState;
    }

    function setRowsActualData(chart) {
        chart.data.rows = actualValues.map(function (date, i) {
            return {
                c: [
                    { v: date },
                    { v: getContractedData(i) },
                    { v: getAssumedData(chart, i) },
                    { v: userData[0]['contractMileage'] },
                    { v: ((i === 3) || (i === 2)) ? userData[0]['assumedMileage'] : null }
                ]
            }
        });
        console.log("chart: ", chart);
        return $q.resolve(chart);
    }

    chartData.options = {
        title: "Sales per month",
        type: 'area',
        colors: [],
        legend: 'none',
        displayExactValues: false,
        crosshair: { trigger: 'both', orientation: 'vertical' },
        vAxis: {
            ticks: [0, 100, 200, 300, 400, 500]
        },
        hAxis: {
        },
        series: {
            2: {
                areaOpacity: 0,
                visibleInLegend: false
            }
        }
    };

    chartData.formatters = {};

    vm.chart = chartData;
}