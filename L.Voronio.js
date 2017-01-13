

    var VoronioLayer = L.GeoJSON.extend({

        color: d3.scale.linear()
                 .domain([0, 100])
                 .range(["#8b0000", "#FFDC00"]),

	    options: {
	        onEachFeature: function(feature, layer) {
	        	console.log(feature.properties);
	            var popupText = "" + feature.properties.value;
	            layer.bindPopup(popupText);
	        }
	    },

        initialize: function (geojson, options) {
        	var self = this;
        	options.style = function(feature) {return self.getStyle(feature);};
            L.setOptions(this, options);
            this._layers = {};
            if (geojson) {
                this._generateVoronioPolygons(geojson);
            }
        },

        setGeoJSON: function(geojson) {
            this.clearLayers();
            this.addData(geojson);
        },

        getStyle: function(feature) {
			return {
				weight: 0.3,
				//weight: 0.5,
				opacity: 0.7,
				color: this.color(feature.properties.value),
				fillColor: this.color(feature.properties.value),
				fillOpacity: 0.7
			};
		},

		_generateVoronioPolygons: function(geojson) {

			var data = [];
			for (var i in geojson.features) {
				var item = geojson.features[i].properties;
				item.position = geojson.features[i].geometry.coordinates;
				data.push(item);
			} 

	        // Compute the polygons for the Voronoi layout.
	        // Before we can use D3's Voronoi functions, we
	        // have to filter out any duplicate positions.
	        var positions = data.map(function(d) { return d.position;})
	            .reduce(function(positions, position) {
	                if (!positions.some(function(p) {
	                    return position[0] === p[0] && position[1] === p[1];
	                })) {
	                    positions.push(position);
	                }
	                return positions;
	            }, []);
	        var polygons = d3.geom.voronoi(positions);



	        var values = [];

	        var features = [];
	        for (var i in polygons) {
	        	var geom = [polygons[i]];
	        	geom[0].push(geom[0][0]);
	        	var polygon = turf.polygon(geom);
	        	features.push(polygon);
	        }

	        for (var i in data) {
	        	values.push(data[i].f_scale);
	        	for (var j in features) {
	        		var pt = turf.point(data[i].position);
	        		var isInside = turf.inside(pt, features[j]);
	        		if (isInside) {
	        			features[j].properties.value = data[i].f_scale;
	        		}
	        	}
	        }



	        this.color = d3.scale.linear()
				.domain([d3.min(values), d3.max(values)])
				// .range(["#8b0000", "#FFDC00"]);
				.range(["blue", "lime", "red"]);


	        var featureCollection = turf.featureCollection(features);

			this.setGeoJSON(featureCollection);

		}

    });

