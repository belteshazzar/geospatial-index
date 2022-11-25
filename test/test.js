
import {expect} from 'chai';

import {fixtures} from './fixtures.js';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import GeospatialDB from '../lib/geospatialdb/geospatialdb.js';

// JSON loader
const loadSync = (filepath) => JSON.parse(fs.readFileSync(filepath));

// Load test fixtures
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directory = path.join(__dirname, 'data/api');
const capitals = loadSync(path.join(directory, 'us_capitals.json'));
const city = loadSync(path.join(directory, 'us_city.json'));
const interstates = loadSync(path.join(directory, 'us_interstates.json'));
const points = loadSync(path.join(directory, 'points.json'));
const pointsId = loadSync(path.join(directory, 'points_id.json'));
const states = loadSync(path.join(directory, 'us_states.json'));

// Geospatial db and apiget created before each test.
let api;

// Process database query for given predicate
const query = (predicate, fixture, expected) => {
  const api = new GeospatialDB()
  api.add({ id: 1, geojson: fixture.features[0]})
  const result = api[predicate](fixture.features[1])
  expect(result.length).to.equal(expected)
};

// Run predicate tests for true, false, and throws cases.
const tests = (predicate) => {
  const cases = fixtures[predicate];

  cases['true'].map((fixture) => {
    query(predicate, fixture, 1);
  });

  cases['false'].map((fixture) => {
    return query(predicate, fixture, 0);
  });

  cases['throws'].map((fixture) => {
    return query(predicate, fixture, 0);
  });
};

beforeEach(() => {
  api = new GeospatialDB()
})

describe("Simple Index Mechanics Tests", () => {

  it("Add geojson to the index",() => {
    const response = api.add({ id: 1, geojson: points });
    expect(response).to.deep.equal({id: 1, bbox: [0,0,1,0], geojson: points})
  })

  it("Load a small collection", () => {
    const response = api.load([{id: 'points', geojson: points}]);
    expect(response).to.deep.equal([{id: 'points', bbox: [0,0,1,0], geojson: points}])
  })

  it('Do not add non-geometry to database',() => {
    expect(api.add({})).to.be.null
  })
  
  it('Do not load non-collection to database', () => {
    expect(api.load([{}])).to.be.null;
  })

  it('Remove post points from db', () => {
    const response = api.add({ id: 1, geojson: points });
    const doc = api.remove(response.id);
  });
  
  it('Load large collection', () => {
    const data = states.features.map(geojson => { return {id: geojson.properties.NAME, geojson: geojson }})
    const docs = api.load(data);
    expect(docs.length).to.equal(50)
  });
})

describe("predicate test suites", () => {

  it('Contains test suite', () => {
    tests('contains');
  })

  it('CoveredBy test suite', () => {
    tests('coveredby');
  });

  it('Covers test suite', () => {
    tests('covers');
  });

  it('Crosses test suite', () => {
    tests('crosses');
  });

  it('Disjoint test suite', () => {
    tests('disjoint');
  });

  it('Equals test suite', () => {
    tests('equals');
  });

  it('Intersects test suite', () => {
    tests('intersects');
  });

  it('Overlaps test suite', () => {
    tests('overlaps');
  });

  it('Touches test suite', () => {
    tests('touches');
  });

  it('Within test suite', () => {
    tests('within');
  });
})

describe("Find miscellaneous tests", () => {
  it('Find point contained in large collection', () => {
    const data = states.features.map(geojson => {
      return {id: geojson.properties.NAME, geojson: geojson }})
    const entries = api.load(data)
    const response = api.contains(city);
  });

  it('Find capital covered by state', () => {
    const data = capitals.features.map(geojson => { 
      return {id: geojson.properties.name, geojson: geojson }})
    api.load(data)

    const res = states.features.map((state) => api.coveredby(state));

    res.forEach((r, index) => {
      expect(r.length).to.equal(1)
    });

  });

  it('Find interstate intersecting state', () => {
    const data = interstates.features.map(geojson => { 
      return {id: geojson.properties.ROUTE_NUM, geojson: geojson }
    })
    api.load(data)
    const res = states.features.map((state) => api.intersects(state));
    res.forEach((r, index) => {
      expect(r.length).to.be.greaterThan(0)
    });
  });
});