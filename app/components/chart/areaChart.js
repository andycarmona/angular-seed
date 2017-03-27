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
            assumedMileage: 4250,
            assumedDate: '2017-03-15T12:52:12.100Z',
            contractStart: '2017-03-01T12:52:12.100Z',
            contractEnd: '2017-03-23T12:52:12.100Z',
            mileage: 375,
            contractMileage: 2500
        };

    const startDate = moment(userData.contractStart);
    const endDate = moment(userData.contractEnd);
    const todaysDate = '2017-03-04';
    const assumedDate = moment(userData.assumedDate);

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
                0: { pointsVisible: false },
                1: { lineDashStyle: dashedLineStyle, pointsVisible: true, areaOpacity: 0.5 },
                2: { lineDashStyle: dashedLineStyle, pointsVisible: false },
                3: {
                    pointsVisible: false,
                    lineDashStyle: dashedLineStyle,
                    areaOpacity: 0,
                    visibleInLegend: true
                },
                4: {
                    pointsVisible: false, areaOpacity: 0,
                    visibleInLegend: false, color: 'red'
                },
                5: {
                    pointsVisible: false, areaOpacity: 0,
                    visibleInLegend: false, color: 'black'
                },

            }
        }
    };


    Init();

    function Init() {
        let promise = Promise.resolve();
        promise
            .then(setRowsActualData)
            .catch(error => console.info(error));
    }

    function setRowsActualData(data) {
        let vehicleData = getVehicleUtilizationData();
        vehicleUtilization = setPrognosData(vehicleData);
        vm.chartData.data.rows = vehicleData.map((data, index) => {
            return { c: data }
        });
    }

    function getColorCodes(color) {
        return {
            'success': 'green',
            'prognos-success': 'lightgreen',
            'prognos-warning': 'pink',
            'warning': 'orange',
            'alert': 'red'
        }[color];
    }

    function setPrognosData(vehicleData) {
        if (vehicleData != undefined) {
            const state = userData.assumedMileage >= userData.contractMileage ? 'alert' : 'prognos-success';
            const serieIndex = vehicleData[vehicleData.length - 1][2].v === null ? 1 : 2;
            setColor(2, state);
            vehicleData[vehicleData.length - 1][3].v = vehicleData[vehicleData.length - 1][serieIndex].v;
            vehicleData.push([
                { 'v': userData.assumedDate, 'f': 'Assumed data ' + userData.assumedDate },
                { 'v': null },
                { 'v': null },
                { 'v': userData.assumedMileage },
                { 'v': userData.contractMileage }]);
            return vehicleData;
        }
    }

    function getRowsDates(date) {
        return { v: date, f: date }
    }

    function getVehicleUtilizationData() {
        let rawData = { 'totalDistance': 0, 'totalDuration': 0, 'totalFuelUsed': 0, 'totalEcoScore': 0, 'utilizationIntervals': [{ 'distance': 756, 'averageSpeed': 55, 'averageDistance': 756, 'averageFuelConsumption': 14, 'averageTotalEcoScore': 78, 'intervalStartDate': '2017-03-02', 'intervalEndDate': '2017-03-02', 'nrOfVehicles': 61, 'nrOfDrivers': 61 }, { 'distance': 446, 'averageSpeed': 98, 'averageDistance': 446, 'averageFuelConsumption': 12, 'averageTotalEcoScore': 31, 'intervalStartDate': '2017-03-03', 'intervalEndDate': '2017-03-03', 'nrOfVehicles': 61, 'nrOfDrivers': 61 }, { 'distance': 844, 'averageSpeed': 55, 'averageDistance': 844, 'averageFuelConsumption': 10, 'averageTotalEcoScore': 76, 'intervalStartDate': '2017-03-04', 'intervalEndDate': '2017-03-04', 'nrOfVehicles': 61, 'nrOfDrivers': 61 }, { 'distance': 233, 'averageSpeed': 64, 'averageDistance': 233, 'averageFuelConsumption': 6, 'averageTotalEcoScore': 95, 'intervalStartDate': '2017-03-05', 'intervalEndDate': '2017-03-05', 'nrOfVehicles': 61, 'nrOfDrivers': 61 }, { 'distance': 863, 'averageSpeed': 54, 'averageDistance': 863, 'averageFuelConsumption': 7, 'averageTotalEcoScore': 28, 'intervalStartDate': '2017-03-06', 'intervalEndDate': '2017-03-06', 'nrOfVehicles': 61, 'nrOfDrivers': 61 }, { 'distance': 757, 'averageSpeed': 79, 'averageDistance': 757, 'averageFuelConsumption': 9, 'averageTotalEcoScore': 57, 'intervalStartDate': '2017-03-07', 'intervalEndDate': '2017-03-07', 'nrOfVehicles': 61, 'nrOfDrivers': 61 }] }
        let mileageHolder = [];
        let actualPassed = false;

        let result = rawData.utilizationIntervals
            .map((element, index) => {
                mileageHolder.push(element.distance);
                element.distance = mileageHolder.reduce((sum, x) => sum + x, 0)
                return {
                    distance: element.distance,
                    intervalStartDate: element.intervalStartDate,
                    status: element.distance >= userData.contractMileage ? 0 : 1
                };
            })
        //result = setOverdueMileage(result);
       
        let index = 1;
        let finalResult = result.map((el, i) => {
            let serie = [getRowsDates(el.intervalStartDate), { v: null }, { v: null }, { v: null }, { v: userData.contractMileage }]
            //return getNodeSeries(el.intervalStartDate, el.distance, el.status);
             setColor(0,'success');
            if (el.distance > userData.contractMileage) { 
                setColor(index,'alert');
                index=2;
               
               console.log("index: ",i);
                serie[index-1]={v:el.distance};
            }
            
            serie[index]={v:el.distance};
            return serie;
        });
        console.log('finalSeries: ', finalResult);
        return finalResult;
    }

    function setTodaysSerie() {
        const elementPos = series.map((x) => x.intervalStartDate > todaysDate).indexOf(true);
        if (elementPos !== -1) {
            series.splice(elementPos - 1, 1, { distance: series.distance, intervalStartDate: 'todays-date' })
        }
        return series;
    }

    function setOverdueMileage(series) {
        const elementPos = series.map((x) => x.distance > userData.contractMileage).indexOf(true);
        if (elementPos !== -1) {
            series.splice(elementPos, 0, { distance: userData.contractMileage, intervalStartDate: 'actual-passed' })
        }
        return series;
    }

    function setColor(index, state) {
        vm.chartData.options.series[index].color = getColorCodes(state);
    }


}
