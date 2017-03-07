'use script';
angular
    .module('myApp')
    .component('areaChart', {
        bindings: {
            data: '<'
        },
        controller: Controller,
        template: `<div google-chart chart='$ctrl.chart' style='$ctrl.chart.cssStyle'></div>`
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
        { name: 'closeToendDate', color: 'orange', line: 'intermitent' },
        { name: 'contractedMileageLine', color: 'red', line: 'intermitent' }];

    const userData = 
        {
            assumedMileage: 475,
            assumedDate: '20170315',
            contractStart: '20170207',
            contractEnd: '20170421',
            mileage: 450,
            contractMileage: 400
        };

    let actualValues = [];
    let assumedData = false;

    var chartData = {
        type: 'ComboChart',
        cssStyle: 'height:200px; width:300px;',
        data: {
            'cols': [
                { id: 'month', label: 'Month', type: 'string' },
                { id: 'line1-id', label: '', type: 'number' },
                { id: 'line2-id', label: '', type: 'number' },
                { id: 'line3-id', label: '', type: 'number' },
                { id: 'line4-id', label: '', type: 'number' },
                { id: 'line5-id', label: '', type: 'number' }

            ], 'rows': []
        },
        options: {
            title: 'Mileage contract',
            type: 'area',
            colors: [],
            legend: 'none',
            displayExactValues: true,
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
        }
    };

    Init();

    function Init() {
        $q.resolve(chartData)
            .then(setDates)
            .then(setLineColors)
            .then(setRowsActualData)
            .catch(error => console.info(error));
    }

    function getAssumedMileage(index) {
        switch (index) {
            case 1:
                return userData['mileage'];
                break;
            case 2:
                return userData['assumedMileage'];
                break;
            case 3:
                return null;
                return userData['assumedMileage'];
                break
        }
    }

    function getActualMileage(index) {
        let startDate = moment(userData['contractStart']).format('MMM');
        let todayDate = moment(Date.Now).format('MMM');

        switch (index) {
            case 0:
                return (startDate === todayDate) ? userData['mileage'] : 0;
                break;
            case 1:
                return userData['mileage'];
                break;
            case 3:
                return null;
                break;
        }
    }

    function setLineColors(chart) {
        chart.options.colors = [
            getChartState('actual', userData['mileage']).color,
            getChartState('prognos', userData['assumedMileage']).color,
            chartStates.find(x => x.name === 'contractedMileageLine').color,
            chartStates.find(x => x.name === 'closeToendDate').color];
        return $q.resolve(chart);
    }

    function setDates(chart) {
        const startDate = moment(userData['contractStart']);
        const endDate = moment(userData['contractEnd']);
        const todaysDate = moment();
        const assumedDate = moment(userData['assumedDate']);

        if (todaysDate.diff(endDate) > 0) {
            assumedData = false;
            actualValues = [startDate.format('LL'), endDate.format('LL'), todaysDate.format('LL')]
        } else if (assumedDate > endDate)  {
            assumedData = true;
            actualValues = [startDate.format('LL'), todaysDate.format('MMM'), endDate.format('LL'), assumedDate.format('LL')]
        } else if (endDate.diff(todaysDate, 'days') <= warnOnDaysClose)  {
            assumedData = true;
            actualValues = [startDate.format('LL'), todaysDate.format('MMM'), endDate.format('LL'), assumedDate.format('LL')]
        } else {
            assumedData = true;
            actualValues = [startDate.format('LL'), todaysDate.format('MMM'), assumedDate.format('LL'), endDate.format('LL')];
        }
        return $q.resolve(chart);
    }

    function getChartState(state = 'prognos', mileageRef) {
        const roofMileage = userData['contractMileage'];
        const param = mileageRef < roofMileage ? `${state}-planned` : `${state}-passed`;
        const resultState = chartStates.find(x => x.name === param);
        return resultState;
    }

    function checkAssumedDataIsNeeded(index) {
        if (assumedData) {
            return ((index === 3) || (index === 2)) ? userData['assumedMileage'] : null
        }
        return null;
    }

    function setRowsActualData(chart) {
        chart.data.rows = actualValues.map(function (date, index) {
            return {
                c: [
                    { v: date },
                    { v: getActualMileage(index) },
                    { v: getAssumedMileage(index) },
                    { v: userData['contractMileage'] },
                    { v: checkAssumedDataIsNeeded(index) }
                ]
            }
        });
        console.log('chart: ', chart);
        return $q.resolve(chart);
    }

    vm.chart = chartData;
}