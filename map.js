

var map = L.map('map', {
  center: [0, 0],
  zoom: 2,
  zoomControl: false
  // scrollWheelZoom: false,
  // tap: false
});

  

var controlLayers = L.control.layers(null, null, {
  position: "topright",
  collapsed: false
}).addTo(map);

var Dark = L.tileLayer('https://{s}.tile.jawg.io/jawg-matrix/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
  attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  minZoom: 0,
  maxZoom: 22,
  subdomains: 'abcd',
  accessToken: '855FoCQBHG0Ho0fCN6whzasHbz5PFGfO5fEaDaRPkgQO0oQi8WVI6GDxE3MTHnxk'
});
controlLayers.addBaseLayer(Dark, 'Light');

var light = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
}).addTo(map);
controlLayers.addBaseLayer(light, 'Dark');

// Creating scale control
var scale = L.control.scale(); 
        scale.addTo(map); // Adding scale control to the map

    var lat = 0;
    var lng = 0;
    var zoom = 2;

//adding custom zoom controls
    L.Control.zoomHome = L.Control.extend({
    options: {
        position: 'topright',
        zoomInText: '+',
        zoomInTitle: 'Zoom in',
        zoomOutText: '-',
        zoomOutTitle: 'Zoom out',
        zoomHomeText: '<i class="fa fa-home" style="line-height:1.65;"></i>',
        zoomHomeTitle: 'Home'
    },

    onAdd: function (map) {
        var controlName = 'gin-control-zoom',
            container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
            options = this.options;

        this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle,
        controlName + '-in', container, this._zoomIn);
        this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle,
        controlName + '-home', container, this._zoomHome);
        this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
        controlName + '-out', container, this._zoomOut);

        this._updateDisabled();
        map.on('zoomend zoomlevelschange', this._updateDisabled, this);

        return container;
    },

    onRemove: function (map) {
        map.off('zoomend zoomlevelschange', this._updateDisabled, this);
    },

    _zoomIn: function (e) {
        this._map.zoomIn(e.shiftKey ? 3 : 1);
    },

    _zoomOut: function (e) {
        this._map.zoomOut(e.shiftKey ? 3 : 1);
    },

    _zoomHome: function (e) {
        map.setView([lat, lng], zoom);
    },

    _createButton: function (html, title, className, container, fn) {
        var link = L.DomUtil.create('a', className, container);
        link.innerHTML = html;
        link.href = '#';
        link.title = title;

        L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', fn, this)
            .on(link, 'click', this._refocusOnMap, this);

        return link;
    },

    _updateDisabled: function () {
        var map = this._map,
            className = 'leaflet-disabled';

        L.DomUtil.removeClass(this._zoomInButton, className);
        L.DomUtil.removeClass(this._zoomOutButton, className);

        if (map._zoom === map.getMinZoom()) {
            L.DomUtil.addClass(this._zoomOutButton, className);
        }
        if (map._zoom === map.getMaxZoom()) {
            L.DomUtil.addClass(this._zoomInButton, className);
        }
    }
});
// add the new control to the map
var zoomHome = new L.Control.zoomHome();
zoomHome.addTo(map);

var layerGroup1 = L.layerGroup().addTo(map);
var layerGroup2 = L.layerGroup().addTo(map);

$.get('./MapDataS.csv', function(csvString) {
  var data = Papa.parse(csvString, { header: true, dynamicTyping: true }).data;

  for (var i = 0; i < data.length; i++) {
    var row = data[i];

    var customIcon2 = L.icon({
        iconUrl: './img/maplaw1.png',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
    });

    var marker2 = L.marker([row.lat, row.long], {
        icon: customIcon2,
    }).bindPopup(
        `<strong>${row.City}</strong><br>State: ${row.State}<br>Entity: ${row.Entity}<br>Score: ${row['Score']}`,
    );

   // layerGroup2.addLayer(marker2);

    var circleMarker = L.circleMarker([row.lat, row.long], {
        radius: 2, // Set your desired radius here
        color: 'red', // Set the color of the circle marker
        //fillColor: 'blue', // Set the fill color of the circle marker
        fillOpacity: 0, // Set the opacity of the fill
        weight: 1.2,
    }).bindPopup(
        `<strong>${row.City}</strong><br>State: ${row.State}<br>Entity: ${row.Entity}<br>Score: ${row['Score']}`,
    );

    layerGroup1.addLayer(circleMarker);
}

});

var overlayMaps = {
  'Markers Group 1': layerGroup1,
  'Markers Group 2': layerGroup2,
};

L.control.layers(null, overlayMaps, { autoZIndex: false }).addTo(map);

// Show only one layer at a time
map.on('overlayadd', function(eventLayer) {
  var visibleLayer = null;
  for (var layerName in overlayMaps) {
    if (map.hasLayer(overlayMaps[layerName]) && layerName !== eventLayer.name) {
      visibleLayer = overlayMaps[layerName];
    }
  }

  if (visibleLayer !== null) {
    map.removeLayer(visibleLayer);
  }
});
