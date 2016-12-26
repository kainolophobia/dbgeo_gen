# dbgeo_gen

Convert database query results with WKB geometries to GeoJSON or TopoJSON, regardless of geometry column name. Heavily inspired by [John J Czaplewski's](https://github.com/jczaplew) [dbgeo](https://github.com/jczaplew/dbgeo). Should work
 with your database of choice (I only tested postgres) .

###### Installation
````
npm install dbgeo_gen
````

###### Example Usage
````javascript
var dbgeo_gen = require('dbgeo_gen')

// Query a database...

dbgeo_gen.parse(data, {
  outputFormat: 'geojson'
}, function(error, result) {
  // This will log a valid GeoJSON FeatureCollection
  console.log(result)  
});

````

See ````test/test.js```` for more examples.


## API

### .parse(data, options, callback)

##### data (***required***)  
An array of objects, usually results from a database query.

##### options (*optional*)
Configuration object that can contain the following keys:

| argument |  description  | values  |  default value  |
|----------|---------------|---------|-----------------|
| `outputFormat`  | Desired output format  | geojson, topojson  | geojson  |
| `precision`     | Trim the coordinate precision of the output to a given number of digits using [geojson-precision](https://github.com/jczaplew/geojson-precision) | *Any integer* | `null` (will not trim precision) |


##### callback (***required***)
A function with two parameters: an error, and a result object.

Examples can be found in ````test/test.js````.

### .defaults{}
The default options for ````.parse()````. You can set these before using ````.parse()```` if you plan to use the same options continuously.

## License
CC0
