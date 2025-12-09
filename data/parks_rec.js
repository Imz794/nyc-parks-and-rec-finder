import { parks, rec_centers } from '../config/mongoCollections.js';

const PAGE_SIZE = 10;

export const parkList = async (page) => {
    const skip = page * PAGE_SIZE;
    const park = await parks();
    return await park.find({}).skip(skip).limit(PAGE_SIZE).toArray();
};

export const recList = async (page) => {
    const skip = page * PAGE_SIZE;
    const rec = await rec_centers();
    return await rec.find({}).skip(skip).limit(PAGE_SIZE).toArray();
};

export const allList = async (page) => {
    const skip = page * PAGE_SIZE;
    
    const park = await parks();
    const rec = await rec_centers();

    const parkAll = await park.find({}).toArray();
    const recAll = await rec.find({}).toArray();

    const merged = parkAll.concat(recAll);

    return merged.slice(skip, skip + PAGE_SIZE);
};
