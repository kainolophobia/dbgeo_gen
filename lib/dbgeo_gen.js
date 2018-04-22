(function () {
    var topojson = require('topojson')
    var wkx = require('wkx')
    var gp = require('geojson-precision')

    var dbgeo_gen = {}

    dbgeo_gen.defaults = {
        outputFormat: 'geojson',
        precision: null
    };

    function wkbstr2geojson(wkbstr) {
        try {
            var buf = new Buffer(wkbstr, 'hex')
            var geojson = wkx.Geometry.parse(buf).toGeoJSON();
            return geojson;
        }
        catch (err) {
            return false;
        }
    };

    dbgeo_gen.parse = function (data, params, callback) {
        // Validate and parse inputs
        if (!data) {
            return callback('You must provide a value for "data"')
        }

        if (!callback) {
            throw new Error('You must provide a callback function')
        }

        params = params || {}

        params.outputFormat = (params && params.outputFormat) ? params.outputFormat : this.defaults.outputFormat
        params.precision = (params && params.precision) ? params.precision : this.defaults.precision

        if (['geojson', 'topojson'].indexOf(params.outputFormat) < 0) {
            return callback('Invalid outputFormat value. Please use either "geojson" or "topojson"')
        }

        var nogeocolums = new Array;
        var geocols = new Array;

        // to check which columns are a wkb geometry,
        // we iterate over the columns of the irst row
        for (var col in data[0]) {

            var geo = wkbstr2geojson(data[0][col]);
            if (geo === false) {
                nogeocolums.push(col);
            }
            else {
                geocols.push(col);
            }
        }
        ;

        var output = {
            type: 'FeatureCollection',
            features: data.map(function (row) {
                return {
                    type: 'Feature',
                    geometry: function (geocolumns) {
                        if (geocolumns.length === 0) {
                            return null;
                        }
                        if (geocolumns.length === 1) {
                            return wkbstr2geojson(row[geocolumns[0]]);
                        }
                        else {
                            var geometries = [];

                            for (var index = 0; index < geocolumns.length; ++index) {

                                var value = geocolumns[index];

                                var geom = wkbstr2geojson(row[value]);

                                geometries.push(geom);
                            }
                            return {type: 'GeometryCollection', geometries: geometries};
                        }

                    }(geocols),
                    properties: function (geocolumns, props) {
                        var properties = {}

                        Object.keys(props).filter(function (d) {
                            if (geocolumns.indexOf(d) < 0) return d
                        }).forEach(function (d) {
                            properties[d] = props[d]
                        })

                        return properties
                    }(geocols, row),
                }
            })
        }

        // Trim coordinate precision, if specified
        if (params.precision) {
            output = gp(output, params.precision)
        }

        // Convert to topojson, if needed
        //console.log(output)
        if (params.outputFormat === 'topojson') {
            callback(null,
                topojson.topology({
                    output: output
                }, {
                    'property-transform': function (feature) {
                        return feature.properties
                    }
                })
            )
        } else {
            callback(null, output)
        }
    }

    module.exports = dbgeo_gen
}())
