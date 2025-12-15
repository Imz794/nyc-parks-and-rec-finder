import csv from "csvtojson";
import { closeConnection, dbConnection } from "../config/mongoConnection.js";
import fs from 'fs';

const db = await dbConnection();

const seedParks = async() =>{
    const parks = db.collection("parks");

    const json = await csv().fromFile('./datasets/parks.csv');

    const newjson = json.map(p => {
        if(p.BOROUGH == 'B'){
            p.BOROUGH = 'Brooklyn';
        }
        else if(p.BOROUGH == 'M'){
            p.BOROUGH = 'Manhattan';
        }
        else if(p.BOROUGH == 'Q'){
            p.BOROUGH = 'Queens';
        }
        else if(p.BOROUGH == 'R'){
            p.BOROUGH = 'Staten Island';
        }
        else{
            p.BOROUGH = 'Bronx';
        }
        
        return{
        _id: Number(p.OBJECTID.replace(/,/g, "")),
        park: true,
        rec_center: false,
        parkName: p.SIGNNAME,
        borough: p.BOROUGH,
        streetAddress: p.ADDRESS,
        zipcode: p.ZIPCODE,
        rating: [],
        score: 0,
        size: Number(p.ACRES),
        type: p.TYPECATEGORY,
        comments: [],
        likes: 0,
        dislikes: 0,
        };
    });

    await parks.deleteMany({});
    await parks.insertMany(newjson);
}

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
        };
    });

await seedParks();
await seedRec();
await closeConnection();

