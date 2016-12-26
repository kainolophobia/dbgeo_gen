var pg = require("pg")
var credentials = require("./credentials")
var dbgeo_gen = require("../lib/dbgeo_gen")
var async = require('async')

var client = new pg.Client("postgres://" + credentials.user + "@" + credentials.host + ":" + credentials.port + "/" + credentials.database)

// Connect to postgres
client.connect(function(error, success) {
  if (error) {
    console.log("Could not connect to postgres");
  }
});

async.series([
  function(callback) {
    console.time('wkb')
    client.query(`
      SELECT name, geom
      FROM maps.medium
      LIMIT 2000
      OFFSET 1000
    `, function(error, result) {
      if (error) return callback(error)
      dbgeo_gen.parse(result.rows, {
        "outputFormat": "geojson"
      }, function(error, result) {
        console.timeEnd('wkb')
        callback(null)
      })
    })
  },

  function(callback) {
    console.time('geojson')
    client.query(`
      SELECT name, geom
      FROM maps.medium
      LIMIT 2000
      OFFSET 1000
    `, function(error, result) {
      if (error) return callback(error)
      dbgeo_gen.parse(result.rows, {
        "outputFormat": "geojson"
      }, function(error, result) {
        console.timeEnd('geojson')
        callback(null)
      })

    })
  }
], function(error) {
  if (error) {
    console.log(error)
  }
  console.log("Done")
  process.exit(0)
})
