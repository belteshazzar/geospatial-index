
import * as de9im from 'de9im';
import GeospatialTree from './geospatialtree.js';

export default GeospatialDB;

/**
 * @description Geospatial database constructor.
 * @private
 */
function GeospatialDB() {
  /**
   * @description R-Tree to store geometries.
   * @private
   */
  this.rtree = new GeospatialTree();

  /**
   * @description Bounding box of all data added to R-Tree.
   * @private
   */
  this.bbox = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-Infinity, -Infinity],
          [Infinity, -Infinity],
          [Infinity, Infinity],
          [-Infinity, Infinity],
          [-Infinity, -Infinity],
        ],
      ],
    },
  };
}
/**
 * @description Find all GeoJSON satisfying the spatial predicate.
 * @param {GeospatialTree} rtree R-Tree to query.
 * @param {GeoJSON} geojson Query GeoJSON.
 * @param {function} predicate Binary spatial predicate (e.g., within).
 * @param {GeoJSON} [rbox] R-Tree querying box. Default is input geojson.
 * @private
 * @return {Promise} Promise with array of document IDs.
 */
GeospatialDB.prototype._predicate = function(geojson, predicate, rbox) {
  rbox = rbox || geojson;
  const raw = this.rtree.query(rbox)
  return raw.filter(doc => {
    return predicate(doc.geojson, geojson, false)
  }).map((doc) => {
    return doc.id;
  });
};
/**
 * @description Add GeoJSON to the database. Uses put method if GeoJSON has _id
 *              property otherwise uses post.
 * @function
 * @instance
 * @memberof PouchDBGeospatial
 * @name add
 * @param {Object} data {id, geojson}.
 * @return {Promise} Promise with db put/post response.
 */
GeospatialDB.prototype.add = function(data) {
  try {
    return this.rtree.add(data)
  } catch (e) {
    return null
  }
};
/**
 * @description Find all GeoJSON containing the query GeoJSON.
 * @function
 * @instance
 * @memberof PouchDBGeospatial
 * @name contains
 * @param {GeoJSON} geojson Query GeoJSON.
 * @return {Promise} Promise with array of document IDs.
 */
GeospatialDB.prototype.contains = function(geojson) {
  return this._predicate(
      geojson,
      de9im.default.contains);
};
/**
 * @description Find all GeoJSON coveredby the query GeoJSON.
 * @function
 * @instance
 * @memberof PouchDBGeospatial
 * @name coveredby
 * @param {GeoJSON} geojson Query GeoJSON.
 * @return {Promise} Promise with array of document IDs.
 */
GeospatialDB.prototype.coveredby = function(geojson) {
  return this._predicate(
      geojson,
      de9im.default.coveredby);
};
/**
 * @description Find all GeoJSON covering the query GeoJSON.
 * @function
 * @instance
 * @memberof PouchDBGeospatial
 * @name covers
 * @param {GeoJSON} geojson Query GeoJSON.
 * @return {Promise} Promise with array of document IDs.
 */
GeospatialDB.prototype.covers = function(geojson) {
  return this._predicate(
      geojson,
      de9im.default.covers);
};
/**
 * @description Find all GeoJSON crossing the query GeoJSON.
 * @function
 * @instance
 * @memberof PouchDBGeospatial
 * @name crosses
 * @param {GeoJSON} geojson Query GeoJSON.
 * @return {Promise} Promise with array of document IDs.
 */
GeospatialDB.prototype.crosses = function(geojson) {
  return this._predicate(
      geojson,
      de9im.default.crosses);
};
/**
 * @description Find all GeoJSON disjoint from the query GeoJSON.
 * @function
 * @instance
 * @memberof PouchDBGeospatial
 * @name disjoint
 * @param {GeoJSON} geojson Query GeoJSON.
 * @return {Promise} Promise with array of document IDs.
 */
GeospatialDB.prototype.disjoint = function(geojson) {
  return this._predicate(
      geojson,
      de9im.default.disjoint,
      this.bbox);
};
/**
 * @description Find all GeoJSON that equal the query GeoJSON.
 * @function
 * @instance
 * @memberof PouchDBGeospatial
 * @name equals
 * @param {GeoJSON} geojson Query GeoJSON.
 * @return {Promise} Promise with array of document IDs.
 */
GeospatialDB.prototype.equals = function(geojson) {
  return this._predicate(
      geojson,
      de9im.default.equals);
};
/**
 * @description Find all GeoJSON intersecting the query GeoJSON.
 * @function
 * @instance
 * @memberof PouchDBGeospatial
 * @name intersects
 * @param {GeoJSON} geojson Query GeoJSON.
 * @return {Promise} Promise with array of document IDs.
 */
GeospatialDB.prototype.intersects = function(geojson) {
  return this._predicate(
      geojson,
      de9im.default.intersects);
};
/**
 * @description Bulk add array of GeoJSON to the database. Uses put method if
 *              GeoJSON has _id property otherwise uses post.
 * @function
 * @instance
 * @memberof PouchDBGeospatial
 * @name load
 * @param {TreeBulkData[]} data Array of id and GeoJSON to add.
 * @return {Promise} Promise with db put/post response.
 */
GeospatialDB.prototype.load = function(data) {
  try {
    return this.rtree.load(data)
  } catch (e) {
    return null
  }
};
/**
 * @description Find all GeoJSON overlapping the query GeoJSON.
 * @function
 * @instance
 * @memberof PouchDBGeospatial
 * @name overlaps
 * @param {GeoJSON} geojson Query GeoJSON.
 * @return {Promise} Promise with array of document IDs.
 */
GeospatialDB.prototype.overlaps = function(geojson) {
  return this._predicate(
      geojson,
      de9im.default.overlaps);
};
/**
 * @description Remove GeoJSON from the database.
 * @function
 * @instance
 * @memberof PouchDBGeospatial
 * @name remove
 * @param {String} id GeoJSON document ID to remove.
 * @return {Promise} Promise with db remove response.
 */
GeospatialDB.prototype.remove = function(id) {
  this.rtree.remove(id);
  return id
};
/**
 * @description Find all GeoJSON touching the query GeoJSON.
 * @function
 * @instance
 * @memberof PouchDBGeospatial
 * @name touches
 * @param {GeoJSON} geojson Query GeoJSON.
 * @return {Promise} Promise with array of document IDs.
 */
GeospatialDB.prototype.touches = function(geojson) {
  return this._predicate(
      geojson,
      de9im.default.touches);
};
/**
 * @description Access underlying R-tree.
 * @function
 * @instance
 * @memberof PouchDBGeospatial
 * @name tree
 * @private
 * @return {GeospatialTree} R-tree.
 */
GeospatialDB.prototype.tree = function() {
  return this.rtree;
};
/**
 * @description Find all GeoJSON within the query GeoJSON.
 * @function
 * @instance
 * @memberof PouchDBGeospatial
 * @name within
 * @param {GeoJSON} geojson Query GeoJSON.
 * @return {Promise} Promise with array of document IDs.
 */
GeospatialDB.prototype.within = function(geojson) {
  return this._predicate(
      geojson,
      de9im.default.within);
};
