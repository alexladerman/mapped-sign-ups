window.onload = function() {
  init();
};

function init() {
    var link = document.querySelector('link[rel="import"]');
    var content = link['import'];
    var entries = content.getElementsByTagName('entry');
    var map;
    drawMap();
    drawMarkers(entries);
    drawGraph(entries);
}

function drawMap() {
    var mapOptions = {
      center: { lat: 40, lng: -4},
      zoom: 8
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}

function drawMarkers(entries) {

	var latlngbounds = new google.maps.LatLngBounds();
    for (var i = 0; i < entries.length; i++) {
        var coords = entries[i].getElementsByTagName('gsx:coord')[0];      
        var latlng = coords['innerText'].split(",");
        var lat = parseFloat(latlng[0]);
        var lng = parseFloat(latlng[1]);
        var latlng = new google.maps.LatLng(lat+((Math.random()*2)-1)/10,lng+((Math.random()*2)-1)/10);
   		latlngbounds.extend(latlng);
        var name = entries[i].getElementsByTagName('gsx:nombre')[0]['innerText'];      
        new google.maps.Marker({ position: latlng, map: map, title:name});
    }

    map.setCenter(latlngbounds.getCenter());
	map.fitBounds(latlngbounds); 
}

function drawGraph(entries) {

	var samples = new Array();

	var formatDate = d3.time.format("dd/MM/YYYY %H:%M:%S");

    for (var i = 0; i < entries.length; i++) {
        var timestamp = entries[i].getElementsByTagName('gsx:timestamp')[0];
        samples.push(stripAndflipDate(timestamp['innerText']));
    }

	var panel = document.querySelector('#panel');
	
	var margin = {top: 30, left: 30, right: 40, bottom: 100};

	var width = panel.offsetWidth - margin.left - margin.right, 
		height = panel.offsetHeight - margin.top - margin.bottom;

	//var freq = {};
	//samples.map(function(v) {freq[v] = freq[v] || 0; freq[v]++;});
	//var data = Object.keys(freq).map(function(k) {var o = {} ; o['t'] = k; o['y'] = freq[k]; return o;});

	var data = d3.layout.histogram()
			   (samples)

	var maxY = d3.max(data, function(d) { return d.y; });
	var dataLength = data.length;

	var barWidth = width/dataLength;

	var x = d3.time.scale.utc()
			.domain([d3.min(samples, function(d) { return d; }),d3.max(samples, function(d) { return d; })])
			.range([0, width]);

	var y = d3.scale.linear()
		.domain([0,maxY])
		.range([height, 0]);

	var chart = d3.select('#panel').append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var formatDate = d3.time.format("%d/%m/%y");

	var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom")
				.tickFormat(formatDate);

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(10);

	chart.append("g")
	.attr("class", "y axis")
	.call(yAxis)
	.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", 6)
	.attr("dy", ".71em")
	.style("text-anchor", "end")
	.text("Frequency");

	chart.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis);

	chart.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d){ return x(d.x);})
      .attr("width",width/data.length-1)
      .attr("y", function(d) { return y(d.y); })
      .attr("height", function(d) { return height - y(d.y); });

}

function stripAndflipDate(str) {
	var parts = str.split(" ")[0].split("/");
	var rv = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
	return rv;
}