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
    const dashedLineStyle = ['4', '4'];
    const chartStates = [
        { name: 'actual-planned', color: '#94c333', line: 'continuos' },
        { name: 'actual-passed', color: '#fa0032', line: 'continuos' },
        { name: 'prognos-planned', color: '#94c333', line: 'intermitent' },
        { name: 'prognos-passed', color: '#fa0032', line: 'intermitent' },
        { name: 'closeToendDate', color: '#fcb60b', line: 'intermitent' },
        { name: 'contractedMileageLine', color: '#94c333', line: 'intermitent' }];

    const userData =
        {
            assumedMileage: 375,
            assumedDate: '20170315',
            contractStart: '20170301',
            contractEnd: '20170321',
            overrideDate: '20170318',
            mileage: 350,
            contractMileage: 400
        };

    const startDate = moment(userData['contractStart']);
    const endDate = moment(userData['contractEnd']);
    const todaysDate = moment();
    const assumedDate = moment(userData['assumedDate']);
    const overrideDate = moment(userData['overrideDate']);

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
            legend: 'none',
            displayExactValues: true,
            vAxis: {
                ticks: [0, 100, 200, 300, 400, 500]
            },
            hAxis: {
            },
            series: {
                0: {},
                1: {},
                2: {},
                3: {
                    areaOpacity: 0,
                    visibleInLegend: true
                },
                4: {},

            }
        }
    };

    Init();

    function Init() {
        $q.resolve(chartData)
            .then(setLinesProperties)
            .then(prepareChartData)
            .then(setRowsActualData)
            .catch(error => console.info(error));
    }

    function prepareChartData(chart) {

        actualValues = [
            { date: startDate.format('LL'), mileage: 0 },
            { date: todaysDate.format('LL'), mileage: userData['mileage'] },
            { date: assumedDate.format('LL'), mileage: userData['assumedMileage'] },
            { date: endDate.format('LL'), mileage: userData['assumedMileage'] }];

        return $q.resolve(chart);
    }

    function setLinesProperties(chart) {
        let actualLine = getChartState('actual', userData['mileage']);
        let prognosLine = getChartState('prognos', userData['assumedMileage']);
        if (prognosLine.name === 'prognos-planned') {
            angular.extend(chart.options.series['1'], { lineDashStyle: dashedLineStyle });
             angular.extend(chart.options.series['1'], { lineDashStyle: dashedLineStyle });
        }
        chart.options.colors = [
            actualLine.color,
            prognosLine.color,
            chartStates.find(x => x.name === 'contractedMileageLine').color,
            'green',
            chartStates.find(x => x.name === 'closeToendDate').color];
        return $q.resolve(chart);
    }

    function getOverridedDistance() {
        return userData['mileage'] - userData['contractMileage'];
    }

    function getChartState(state = 'prognos', mileageRef) {
        const roofMileage = userData['contractMileage'];
        const param = mileageRef < roofMileage ? `${state}-planned` : `${state}-passed`;

        const resultState = chartStates.find(x => x.name === param);
        return resultState;
    }
    
    function setRowsActualData(chart) {
        chart.data.rows = actualValues.map((data, index) => {
            return {
                c: [
                    getRowsDates(data, index),
                    { v: getActualRowData(data, index) },
                    { v: getPrognosRowData(data, index) },
                    { v: getOverridedRowData(data, index) },
                    { v: userData['contractMileage'] }
                ]
            }
        })
        console.log("chart: ", chart);
        return $q.resolve(chart);
    }

    function getRowsDates(data) {
      
            return { v: data['date'], f: data['date'] }
    
    }

    function getActualRowData(dat, index) {
        if (index < 2) {
            return dat['mileage']
        }
        return null
    }

    function getPrognosRowData(dat, index) {
        if ((index > 0) && (index < 3)) {
            return dat['mileage'];
        }
        return null;
    }

    function checkOverrideContractMileage(data) {
        return data['mileage'] > userData['contractMileage'];
    }

    function getOverridedRowData(data, index) {
        if (index >= 2) {
            return data['mileage'];
        }
        return null;
    }

    vm.chart = chartData;
}
