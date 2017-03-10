'use script';
angular
    .module('myApp')
    .component('areaChart', {
        bindings: {
            data: '<'
        },
        controller: Controller,
        template: `<div google-chart chart='$ctrl.chartData' style='$ctrl.chartData.cssStyle'></div>`
    });

Controller.$inject = ['$q']

function Controller($q) {
    const vm = this;
    const warnOnDaysClose = 30;
    const dashedLineStyle = ['4', '4'];


    const userData =
        {
            assumedMileage: 425,
            assumedDate: '20170315',
            contractStart: '20170301',
            contractEnd: '20170321',
            mileage: 375,
            contractMileage: 2000
        };

    const startDate = moment(userData['contractStart']);
    const endDate = moment(userData['contractEnd']);
    const todaysDate = moment();
    const assumedDate = moment(userData['assumedDate']);

    let actualValues = [];

    let assumedData = false;

    vm.chartData = {
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
            pointSize: 5,
            seriesType: 'area',
            legend: 'none',
            displayExactValues: true,
            selectionMode: 'multiple',
            aggregationTarget: 'none',
            vAxis: {
            },
            hAxis: {
            },
            vAxes: {
                series: {
                    0: { pointSize: 5 },
                    2: { pointSize: 5 }
                }
            },
            series: {
                0: { pointsVisible: false, color: 'red' },
                1: { lineDashStyle: dashedLineStyle, pointsVisible: true, areaOpacity: 0.2, color: 'blue' },
                2: { lineDashStyle: dashedLineStyle, pointsVisible: false, color: 'yellow' },
                3: {
                    pointsVisible: false,
                    lineDashStyle: dashedLineStyle,
                    areaOpacity: 0,
                    visibleInLegend: true, color: 'blue'
                },
                4: { pointsVisible: false, color: 'black' },

            }
        }
    };


    Init();

    function Init() {
        let promise = Promise.resolve();
        promise.then(() => { vm.vehicleUtilization = getVehicleUtilizationData() })
            .then(prepareChartData)
            // .then(setLinesProperties)
            .then(setRowsActualData)
            .catch(error => console.info(error));
    }

    function prepareChartData(data) {
        console.log("vehicle utilizatio: ", getVehicleUtilizationData());

        actualValues = [...getVehicleUtilizationData()];

        /* actualValues = angular.merge([], initialValues, [
             { property: getChartState(state = 'actual', userData['mileage']) },
             { property: getChartState(state = 'prognos', userData['assumedMileage']) },
             { property: { color: getLineColors('closeToendDate').color } }]);*/

    }

    function getLineColors(lineParam) {
        const linesProperties = [
            { name: 'actual-planned', color: '#94c333' },
            { name: 'actual-passed', color: '#fa0032' },
            { name: 'prognos-planned', color: '#94c333' },
            { name: 'prognos-passed', color: 'red' },
            { name: 'closeToendDate', color: 'orange' },
            { name: 'contractedMileageLine', color: 'lightgreen' }];

        return linesProperties.find(x => x.name === lineParam);
    }

    function setLinesProperties() {
        vm.chartData.options.colors = [
            actualValues[0].property.color,
            actualValues[1].property.color,
            actualValues[2].property.color,
            getLineColors('contractedMileageLine').color,
        ];
    }



    function getChartState(state = 'prognos', mileageRef) {
        const roofMileage = userData['contractMileage'];
        const param = mileageRef < roofMileage ? `${state}-planned` : `${state}-passed`;
        return getLineColors(param);
    }

    function setRowsActualData() {
        vm.chartData.data.rows = actualValues.map((data, index) => {

            console.log("initialSeries: ", getInitialSeries(data),index);
            return { c: getInitialSeries(data, index) }
            /*  return {
                  c: [
                      getRowsDates(data, index),
                      { v: getInitialSeries(data, index) },
                      { v: null },
                      { v: userData['contractMileage'] }
                  ]
              }*/
        });
    }

    function getContractLine() {
        return [{ v: null }, { v: null }, { v: userData['contractMileage'] }]
    }

    function getInitialSeries(data, index) {
         console.log("index: ",index);
        let actualRow;
        if (data['state'] === "actual-planned") {
            actualRow = [getRowsDates(data), { v: data['mileage'] }, { v: null }];
        } else if (data['state'] === 'actual-passed') {
            if (actualValues[index].state !== 'actual-planned') {
                actualRow = [getRowsDates(data), { v: null }, { v: data['mileage'] }];
            } else {
                actualRow = [getRowsDates(data), { v: data['mileage'] }, { v: data['mileage'] }];
            }
        }

        return actualRow;
    }

    function getRowsDates(data) {

        return { v: data['date'], f: data['date'] }

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

    function getVehicleUtilizationData() {
        let rawData = { "totalDistance": 0, "totalDuration": 0, "totalFuelUsed": 0, "totalEcoScore": 0, "utilizationIntervals": [{ "distance": 756, "averageSpeed": 55, "averageDistance": 756, "averageFuelConsumption": 14, "averageTotalEcoScore": 78, "intervalStartDate": "2017-03-02", "intervalEndDate": "2017-03-02", "nrOfVehicles": 61, "nrOfDrivers": 61 }, { "distance": 446, "averageSpeed": 98, "averageDistance": 446, "averageFuelConsumption": 12, "averageTotalEcoScore": 31, "intervalStartDate": "2017-03-03", "intervalEndDate": "2017-03-03", "nrOfVehicles": 61, "nrOfDrivers": 61 }, { "distance": 844, "averageSpeed": 55, "averageDistance": 844, "averageFuelConsumption": 10, "averageTotalEcoScore": 76, "intervalStartDate": "2017-03-04", "intervalEndDate": "2017-03-04", "nrOfVehicles": 61, "nrOfDrivers": 61 }, { "distance": 233, "averageSpeed": 64, "averageDistance": 233, "averageFuelConsumption": 6, "averageTotalEcoScore": 95, "intervalStartDate": "2017-03-05", "intervalEndDate": "2017-03-05", "nrOfVehicles": 61, "nrOfDrivers": 61 }, { "distance": 863, "averageSpeed": 54, "averageDistance": 863, "averageFuelConsumption": 7, "averageTotalEcoScore": 28, "intervalStartDate": "2017-03-06", "intervalEndDate": "2017-03-06", "nrOfVehicles": 61, "nrOfDrivers": 61 }, { "distance": 757, "averageSpeed": 79, "averageDistance": 757, "averageFuelConsumption": 9, "averageTotalEcoScore": 57, "intervalStartDate": "2017-03-07", "intervalEndDate": "2017-03-07", "nrOfVehicles": 61, "nrOfDrivers": 61 }] }
        let temp = [];
        return rawData.utilizationIntervals.map((element) => {
            temp.push(element.distance);
            let referensDate = getUpdatedSeries(element);
            let sumMileage = temp.reduce((sum, x) => sum + x, 0);
            let actualObject = referensDate !== null
                ? referensDate
                : { date: element.intervalStartDate, mileage: sumMileage, state: getState(sumMileage) }

            return actualObject;
        })
    }

    function setSerieColor() {

    }

    function getState(mileage) {
        let state = 'actual-planned';
        if (mileage > userData['contractMileage']) {
            state = 'actual-passed';
        }
        return state
    }

    function getUpdatedSeries(serie) {

        /*        { date: todaysDate.format('LL'), mileage: userData['mileage'] },
                { date: assumedDate.format('LL'), mileage: userData['assumedMileage'] },
                { date: endDate.format('LL'), mileage: userData['assumedMileage'] }*/

        return null
    }

}
