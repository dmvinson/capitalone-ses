'use strict';

const mymap = L.map('stationMap', {
	center: [34.0522222, -118.2427778],
	zoom: 13
});

function updateInfoBox(event, stationData) {
	const stationID = event.target.options.title.split(' ')[1];
	const station = stationData.stations[stationID];

	const el = document.getElementById('station-info');
	el.innerHTML = `<strong>Station ${stationID}</strong> <small>${station.place},</small> <small>Location:${station.location[0]},${station.location[1]}</small><br>`;
	const infoList = document.createElement('ul');
	const infoArr = [
		`This station was involved in a total of ${station.totalTrips} trips.`,
		`Trips to this station were most commonly coming from ${stationData.stations[station.mostCommonFrom].place}.`,
		`Trips from this station were most commonly heading to ${stationData.stations[station.mostCommonTo].place}.`,
		`The average distance travelled to or from this station was ${station.averageDistance.toFixed(2)}m.`,
		`The average time for trips to or from this station was ${formatSeconds(station.averageTime)}`
	];
	infoArr.forEach(stat => {
		var node = document.createElement('li');
		var text = document.createTextNode(stat);
		node.appendChild(text);
		infoList.appendChild(node);
	});
	el.appendChild(infoList);
}

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	id: 'mapbox.streets',
	accessToken: 'pk.eyJ1IjoiZG12aW5zb24zMjYiLCJhIjoiY2pudHFpdzM2MHdoaTN2bnQ3ZncyanBnayJ9.GzikvK9YLnA9tfOgI2xAnQ'
}).addTo(mymap);

fetch('data/stations.json').then(function(response) {
	return response.json();
}).then((stationInfo) => {
	for (const [key, value] of Object.entries(stationInfo.stations)) {
		let stationMarker = L.marker(value.location, {
			title: `Station ${key}`
		}).addTo(mymap).on('click', (event) => {
			updateInfoBox(event, stationInfo);
		});
		let rankingStr = `Station ${key}\nStart Ranking: ${value.startRanking}\nEnd Ranking: ${value.endRanking}`
		stationMarker.bindTooltip(rankingStr).openTooltip();
	}
	return stationInfo;
}).then((data) => {
	const sortedAreas = Object.keys(data.areaStationCounts).sort((a, b) => {
		return data.areaStationCounts[b] - data.areaStationCounts[a];
	});
	const ctx = document.getElementById('areaStationChart').getContext('2d');
	new Chart(ctx, {
		type: 'pie',
		data: {
			labels: sortedAreas,
			datasets: [{
				data: sortedAreas.map((x) => {
					return data.areaRideCounts[x];
				}),
				backgroundColor: COLORS.slice(0, sortedAreas.length),
				label: 'Area-Number of Rides'
			}, {
				data: sortedAreas.map((x) => {
					return data.areaStationCounts[x];
				}),
				backgroundColor: COLORS.slice(0, sortedAreas.length),
				label: 'Area-Number of Stations'
			}],
		}
	});
	return data;
}).then((data) => {
	const ctx = document.getElementById('areaHourlyCounts').getContext('2d');
	new Chart(ctx, {
		type: 'line',
		data: {
			labels: [...Array(24).keys()].map((x) => x < 10 ? `0${x}:00`: `${x}:00`),
			datasets: Object.keys(data.areaHourlyCounts).map((key, i) => {
				return {
					data: data.areaHourlyCounts[key],
					backgroundColor: COLORS[i],
					borderColor: COLORS[i],
					label: key,
					fill:false
				};
			})
		},
		options: {
			scales: {
				yAxes: [{
					scaleLabel: {
						display: true,
						labelString: 'Number of Rides'
					}
				}],
				xAxes: [{
					scaleLabel: {
						display: true,
						labelString: 'Time of Day'
					}
				}]
			}
		}
	});
});


const bikeData = {
	'4727': 312,
	'6583': 275,
	'5839': 268,
	'6328': 260,
	'6162': 260,
	'6618': 258,
	'6075': 257,
	'6435': 257,
	'6254': 252,
	'6635': 250
};

const sortedBikeIDs = Object.keys(bikeData).sort((a, b) => {
	return bikeData[b] - bikeData[a]
});




let ctx = document.getElementById('mostUsedBikes').getContext('2d');
new Chart(ctx, {
	type: 'bar',
	data: {
		labels: sortedBikeIDs.map((x) => {
			return `Bike ${x}`;
		}),
		datasets: [{
			label: 'Most Used Bikes',
			backgroundColor: 'rgb(255, 99, 132)',
			borderColor: 'rgb(255, 99, 132)',
			data: sortedBikeIDs.map((x) => {
				return bikeData[x];
			}),
		}]
	},
	options: {
		scales: {
			yAxes: [{
				ticks: {
					suggestedMin: 0
				}
			}]
		}
	}
});



// Time v. Duration

const durationAverages = [3213.6174985978687, 3268.439821693908, 3911.7241379310344, 1939.6412556053813, 1341.1933174224343, 1186.6548042704626, 905.4764638346728, 882.0290465165228, 1141.8554913294797, 1282.3746617857712, 1606.0369685767098, 1650.133368200837, 1604.883396452063, 1620.509775821476, 1696.614080527431, 1691.6960749009722, 1502.0464092818563, 1303.2776831345827, 1318.7655502392345, 1454.4676566826076, 1514.742285237698, 1756.1122490782466, 1990.0625978090766, 2135.1694304253783];
ctx = document.getElementById('timeDuration').getContext('2d');
var timeDurationChart = new Chart(ctx, {
	type: 'line',
	data: {
		labels: [...Array(24).keys()].map((x) => x < 10 ? `0${x}:00`: `${x}:00`),
		datasets: [{
			label: 'Time vs. Duration',
			data: durationAverages.map((x) => x/60),
			backgroundColor: 'blue',
			borderColor: 'blue',
			fill: false
		}]
	},
	options: {
		responsive: true,
		title: {
			display: true,
			text: 'Time vs. Duration'
		},
		scales: {
			yAxes: [{
				scaleLabel: {
					display: true,
					labelString: 'Duration (min.)'
				}
			}],
			xAxes: [{
				scaleLabel: {
					display: true,
					labelString: 'Time'
				}
			}]
		}
	}
});

// Time v. Num Rides
const hourlyCounts = [1783, 1346, 870, 446, 419, 562, 1742, 4751, 6920, 6283, 5410, 7648, 10034, 9769, 8494, 8331, 9998, 11740, 10450, 7946, 5995, 4882, 3834, 2774];
ctx = document.getElementById('hourlyCounts').getContext('2d');
new Chart(ctx, {
	type: 'line',
	data: {
		labels: [...Array(24).keys()].map((x) => x < 10 ? `0${x}:00`: `${x}:00`),
		datasets: [{
			label: 'Time vs. Number of Rides',
			data: hourlyCounts,
			backgroundColor: 'purple',
			borderColor: 'purple',
			fill: false
		}]
	},
	options: {
		scales: {
			yAxes: [{
				scaleLabel: {
					display: true,
					labelString: 'Number of Rides'
				}
			}],
			xAxes: [{
				scaleLabel: {
					display: true,
					labelString: 'Time'
				}
			}]
		}
	}
});


// Commuter Data

var seasonalCommuteCount = [
	['Winter', 3918],
	['Spring', 2587],
	['Fall', 8482],
	['Summer', 5450]
];

var weeklyCounts = [[[2016, 27], 80], [[2016, 28], 468], [[2016, 29], 475], [[2016, 30], 592], [[2016, 31], 767], [[2016, 32], 847], [[2016, 33], 735], [[2016, 34], 749], [[2016, 35], 737], [[2016, 36], 671], [[2016, 37], 764], [[2016, 38], 710], [[2016, 39], 690], [[2016, 40], 817], [[2016, 41], 761], [[2016, 42], 599], [[2016, 43], 611], [[2016, 44], 689], [[2016, 45], 603], [[2016, 46], 627], [[2016, 47], 379], [[2016, 48], 561], [[2016, 49], 506], [[2016, 50], 425], [[2016, 51], 284], [[2017, 1], 281], [[2017, 2], 215], [[2017, 3], 332], [[2017, 4], 360], [[2017, 5], 408], [[2017, 6], 289], [[2017, 7], 430], [[2017, 8], 388], [[2017, 9], 492], [[2017, 10], 574], [[2017, 11], 541], [[2017, 12], 522], [[2017, 13], 458]]

ctx = document.getElementById('commuteCounts').getContext('2d');
var commuterChart = new Chart(ctx, {
	type: 'bar',
	data: {
		labels: seasonalCommuteCount.map((x) => x[0]),
		datasets: [{
			label: 'Season Ride Count',
			data: seasonalCommuteCount.map((x) => x[1]),
			backgroundColor: 'orange',
			borderColor: 'orange'
		}]
	},
	options: {
		scales: {
			yAxes: [{
				ticks: {
					suggestedMin: 0
				}
			}]
		}
	}
});

function setDataSeasonal() {
	commuterChart.data.labels = seasonalCommuteCount.map((x) => x[0]);
	commuterChart.data.datasets[0] = {
		label: 'Seasonal Ride Counts',
		data: seasonalCommuteCount.map((x) => x[1]),
		backgroundColor: 'orange',
		borderColor: 'orange'
	};
	commuterChart.update();
}

function setDataWeekly() {
	commuterChart.data.labels = weeklyCounts.map((x) => {
		return `${x[0][0]}-${x[0][1]}`
	});
	commuterChart.data.datasets[0] = {
		label: 'Commuter Ride Count Weekly',
		data: weeklyCounts.map((x) => x[1]),
		backgroundColor: 'green',
		borderColor: 'green'
	};
	commuterChart.update();
}

document.getElementById('commuterSeasonalButton').addEventListener('click',setDataSeasonal);
document.getElementById('commuterWeeklyButton').addEventListener('click',setDataWeekly);


var commuterPassData = [
	['Monthly Pass', 16029], 
	['Walk-up', 3179], 
	['Flex Pass', 1387], 
	['Staff Annual', 82]
];

ctx = document.getElementById('commuterPassTypes').getContext('2d');
var passTypeChart = new Chart(ctx, {
	type: 'doughnut',
	data: {
		datasets: [{
			data: commuterPassData.map((x)=> x[1]),
			backgroundColor: ['red', 'orange', 'purple', 'green']
		}],
		labels: commuterPassData.map((x) => x[0])
	}
});


const countUpOptions = {
	useEasing: true,
	useGrouping: true,
	separator: ',',
	decimal: '.'
};
const AVERAGE_DISTANCE = 5427.192425600836;
const distanceCountUp = new CountUp('averageDistance', 0, AVERAGE_DISTANCE, 2, 5, {
	useEasing: true,
	useGrouping: true,
	separator: ',',
	decimal: '.',
	suffix: 'm'
});

const AVERAGE_DURATION = 1691;
const durationCountUp = new CountUp('averageDuration', 0, AVERAGE_DURATION, 0, 5, {
	useEasing: true,
	useGrouping: true,
	separator: ',',
	decimal: '.',
	suffix: 's'
});

let AVERAGE_RIDES_PER_WEEK = weeklyCounts.reduce((prev, current) => {
	return prev + current[1];
}, 0);
AVERAGE_RIDES_PER_WEEK /= weeklyCounts.length;
const weeklyRidesCountUp = new CountUp('ridesPerWeek', 0, AVERAGE_RIDES_PER_WEEK, 0, 5, countUpOptions);

const NUM_BIKES = 763;
const bikeCountUp = new CountUp('numBikes', 0, NUM_BIKES, 0, 5, countUpOptions);
const NUM_TRIPS = 132427;
const tripCountUp = new CountUp('numTrips', 0, NUM_TRIPS, 0, 5, countUpOptions);

distanceCountUp.start();
durationCountUp.start();
weeklyRidesCountUp.start();
bikeCountUp.start();
tripCountUp.start();