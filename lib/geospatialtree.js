
import RBush from 'rbush';
import * as turf from '@turf/turf';

export default GeospatialTree;

/**
 * @description Geospatial RBush that uses bounding boxes.
 * @private
 */
class RTree extends RBush {
  /**
   * @description Geospatial RBush that expected items with IDs and bboxes.
   * @param {Array} item {id, bbox}.
   * @private
   * @return {Object} {minX, minY, maxX, maxY}
   */
  toBBox(item) {
    return {
      minX: item.bbox[0],
      minY: item.bbox[1],
      maxX: item.bbox[2],
      maxY: item.bbox[3],
      id: item.id,
    };
  }
  /**
   * @description Compare minimum x between two items.
   * @param {Object} a Item #1.
   * @param {Object} b Item #2.
   * @private
   * @return {Number} Positive if 'a' x is greater than 'b' otherwise negative.
   */
  compareMinX(a, b) {
    return a.bbox[0] - b.bbox[0];
  }
  /**
   * @description Compare minimum y between two items.
   * @param {Object} a Item #1.
   * @param {Object} b Item #2.
   * @private
   * @return {Number} Positive if 'a' y is greater than 'b' otherwise negative.
   */
  compareMinY(a, b) {
    return a.bbox[1] - b.bbox[1];
  }
}

/**
 * @description Geospatial tree constructor
 * @private
 */
function GeospatialTree() {
  /**
   * @description R-Tree to store geometries.
   * @private
   */
  this.rtree = new RTree();
}

/**
 * @description Add GeoJSON to the R-Tree.
 * @memberof GeospatialTree
 * @param {Object} item {id, geojson}.
 * @return {Object} Object with id and bbox {id, bbox}.
 */
GeospatialTree.prototype.add = function(item) {
  const bbox = item.geojson.bbox || turf.bbox(item.geojson);
  const entry = {id: item.id, bbox: bbox, geojson: item.geojson};
  this.rtree.insert(entry);
  return entry;
};
/**
 * @description Add array of GeoJSONs to the R-Tree.
 * @memberof GeospatialTree
 * @param {Object[]} items Object array of id and GeoJSON to add.
 * @return {Object[]} Object array of id and bounding boxes loaded
 *                    {id, geojson, bbox}.
 */
GeospatialTree.prototype.load = function(items) {
  const entries = items.map((item) => {
    const bbox = item.geojson.bbox || turf.bbox(item.geojson);
    return {id: item.id, bbox: bbox, geojson: item.geojson};
  });
  this.rtree.load(entries);
  return entries;
};

/**
 * @description Remove document from the R-Tree.
 * @memberof GeospatialTree
 * @param {String} id of the document to be removed.
 * @return {String} The id of the document removed.
 */
GeospatialTree.prototype.remove = function(id) {
  // const bbox = item.geojson.bbox || turf.bbox(item.geojson);
  // const entry = {id: item.id, bbox};
  this.rtree.remove(null, (a, b) => {
    return a.id === b.id;
  });
  return id;
};

/**
 * @description Find all GeoJSON that collide with query GeoJSON.
 * @memberof GeospatialTree
 * @param {GeoJSON} geojson Query GeoJSON with polygon features.
 * @return {Promise} Promise with array objects with id and bbox properties.
 */
GeospatialTree.prototype.query = function(geojson) {
  const bbox = geojson.bbox || turf.bbox(geojson);
  const extents = {
    minX: bbox[0],
    minY: bbox[1],
    maxX: bbox[2],
    maxY: bbox[3],
  };
  return this.rtree.search(extents);
};
