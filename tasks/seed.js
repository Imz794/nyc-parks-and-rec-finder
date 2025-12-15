import csv from "csvtojson";
import { closeConnection, dbConnection } from "../config/mongoConnection.js";
import fs from 'fs';

const db = await dbConnection();

function extractCenterFromMultipolygon(multipolygonString) {
    if (!multipolygonString || multipolygonString === '') {
      return null;
    }
    
    try {
      const coordMatches = multipolygonString.match(/-?\d+\.\d+\s+-?\d+\.\d+/g);
      
      if (!coordMatches || coordMatches.length === 0) {
        return null;
      }
      
      let totalLng = 0;
      let totalLat = 0;
      let count = 0;
      
      for (let coordPair of coordMatches) {
        const [lng, lat] = coordPair.split(/\s+/).map(Number);
        if (!isNaN(lng) && !isNaN(lat)) {
          totalLng += lng;
          totalLat += lat;
          count++;
        }
      }
      
      if (count === 0) {
        return null;
      }
      
      return {
        lat: totalLat / count,
        lng: totalLng / count
      };
    } catch (e) {
      console.error('Error extracting coordinates:', e);
      return null;
    }
}

const seedParks = async() => {
    const parks = db.collection("parks");
    const json = await csv().fromFile('./datasets/parks.csv');
    
    const newjson = json.map(p => {
      let borough;
      if (p.BOROUGH == 'B') {
        borough = 'Brooklyn';
      } else if (p.BOROUGH == 'M') {
        borough = 'Manhattan';
      } else if (p.BOROUGH == 'Q') {
        borough = 'Queens';
      } else if (p.BOROUGH == 'R') {
        borough = 'Staten Island';
      } else {
        borough = 'Bronx';
      }
      
      const coords = extractCenterFromMultipolygon(p.multipolygon);
      
      return {
        _id: Number(p.OBJECTID.replace(/,/g, "")),
        park: true,
        rec_center: false,
        parkName: p.SIGNNAME,
        borough: borough,
        streetAddress: p.ADDRESS,
        zipcode: p.ZIPCODE,
        rating: [],
        size: Number(p.ACRES),
        type: p.TYPECATEGORY,
        comments: [],
        likes: 0,
        dislikes: 0,
        lat: coords ? coords.lat : null,
        lng: coords ? coords.lng : null
      };
    });
    
    await parks.deleteMany({});
    await parks.insertMany(newjson);
    console.log('Parks seeded with coordinates!');
};

const seedRec = async() =>{
    const recs = db.collection("rec_centers");

    const file = fs.readFileSync('./datasets/rec_centers.json', 'utf8');
    const json = JSON.parse(file);

    const newjson = json.map(r => {
        return{
        _id: r.Prop_ID,
        park: false,
        rec_center: true,
        recCenterName: r.NAME,
        streetAddress: r.ADDRESS,
        zipcode: r.ZIP,
        rating: [],
        score: 0,
        hours: r.Building_Hours,
        phoneNumber: r.PHONE,
        comments: [],
        likes: 0,
        dislikes: 0,
        lat: null,
        lng: null 
        };
    });

    await recs.deleteMany({});
    await recs.insertMany(newjson);
    console.log('Rec centers seeded!');
}

await seedParks();
await seedRec();
await closeConnection();

