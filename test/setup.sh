#! /bin/bash

export DB_USER=postgres

curl -LOk http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/110m/cultural/ne_110m_admin_0_countries.zip -o "ne_110m_admin_0_countries.zip"

curl -LOk http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/110m/cultural/ne_110m_populated_places.zip -o "ne_110m_populated_places.zip"

unzip ne_110m_admin_0_countries.zip

unzip ne_110m_populated_places.zip

rm ne_110m_admin_0_countries.zip
rm ne_110m_populated_places.zip

psql -U $DB_USER -h localhost postgres -c "CREATE database dbgeo_gen;"

psql -U $DB_USER -h localhost dbgeo_gen -c "CREATE EXTENSION postgis;"
psql -U $DB_USER -h localhost dbgeo_gen -c "CREATE EXTENSION postgis_topology;"

shp2pgsql -s 4326 -W "latin1" ne_110m_admin_0_countries.shp public.countries | psql -h localhost -U $DB_USER -d dbgeo_gen -p 5432

shp2pgsql -s 4326 -W "latin1" ne_110m_populated_places.shp public.places | psql -h localhost -U $DB_USER -d dbgeo_gen -p 5432

rm ne_*
