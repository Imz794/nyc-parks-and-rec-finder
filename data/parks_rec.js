import { parks, rec_centers } from '../config/mongoCollections.js';

export const parkList = async(page) =>{
    let pageSet = page * 10;
    let park = await parks();
    let parkList = await park.find({}).skip(pageSet).limit(10).toArray();
    return parkList;
}

export const recList = async(page) =>{
    let pageSet = page * 10;
    let rec = await rec_centers();
    let recList = await rec.find({}).skip(pageSet).limit(10).toArray();

    return recList;
}

export const allList = async(page) =>{
    let pageSet = page * 10;
    let park = await parks();
    let parkList = await park.find({}).skip(pageSet).limit(10).toArray();
    let rec = await rec_centers();
    let recList = await rec.find({}).skip(pageSet).limit(10).toArray();
    let allList = parkList + recList;
    allList = allList.slice(pageSet, pageSet + 10);

    return allList;
}