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


    const userData =
        {
            assumedMileage: 399,
            assumedDate: '20170315',
            contractStart: '20170301',
            contractEnd: '20170321',
            mileage: 375,
            contractMileage: 400
        };

    const startDate = moment(userData['contractStart']);
    const endDate = moment(userData['contractEnd']);
    const todaysDate = moment();
    const assumedDate = moment(userData['assumedDate']);

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
                1: { lineDashStyle: dashedLineStyle },
                2: { lineDashStyle: dashedLineStyle },
                3: {
                    lineDashStyle: dashedLineStyle,
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
            .then(prepareChartData)
            .then(setLinesProperties)
            .then(setRowsActualData)
            .catch(error => console.info(error));
    }

    function prepareChartData(chart) {

        let initialValues = [
            { date: startDate.format('LL'), mileage: 0 },
            { date: todaysDate.format('LL'), mileage: userData['mileage'] },
            { date: assumedDate.format('LL'), mileage: userData['assumedMileage'] },
            { date: endDate.format('LL'), mileage: userData['assumedMileage'] }];

        actualValues = angular.merge([], initialValues, [
            { property: getChartState(state = 'actual', userData['mileage']) },
            { property: getChartState(state = 'prognos', userData['assumedMileage']) },
            { property: { color: getLineColors('closeToendDate').color } }]);

        return $q.resolve(chart);
    }

    function getLineColors(lineParam) {
        const linesProperties = [
            { name: 'actual-planned', color: '#94c333' },
            { name: 'actual-passed', color: '#fa0032' },
            { name: 'prognos-planned', color: '#94c333' },
            { name: 'prognos-passed', color: 'red' },
            { name: 'closeToendDate', color: 'orange' },
            { name: 'contractedMileageLine', color: 'yellow' }];

        return linesProperties.find(x => x.name === lineParam);
    }

    function setLinesProperties(chart) {
        chart.options.colors = [
            actualValues[0].property.color,
            actualValues[1].property.color,
            actualValues[2].property.color,
            getLineColors('contractedMileageLine').color,
        ];
        return $q.resolve(chart);
    }



    function getChartState(state = 'prognos', mileageRef) {
        const roofMileage = userData['contractMileage'];
        const param = mileageRef < roofMileage ? `${state}-planned` : `${state}-passed`;
        return getLineColors(param);
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
        return (index < 2) ? dat['mileage'] : null;
    }

    function getPrognosRowData(dat, index) {
        return ((index > 0) && (index < 3)) ? dat['mileage'] : null;
    }

    function checkOverrideContractMileage(data) {
        return data['mileage'] > userData['contractMileage'];
    }

    function getOverridedRowData(data, index) {

        if ((index >= 2) && (isCloseToEndOfContract())) {
            return data['mileage']
        }
        return null;
    }

    function getOverridedDistance() {

        return userData['mileage'] - userData['contractMileage'];
    }

    function isCloseToEndOfContract() {
        return endDate.diff(todaysDate, 'days') <= warnOnDaysClose;
    }

    vm.chart = chartData;
}
