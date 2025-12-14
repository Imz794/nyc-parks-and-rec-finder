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

export const hasHours = (facility) => {
    let hours = facility.hours;
    for(let day of Object.values(hours)){
        if(day.startTime != null){
            return true;
        }
    }
    return false;
};

export const getHours = (facility) => {
    let hours = facility.hours;
    let newHours = hours;
    for(let day of Object.values(newHours)){
        if(day.startTime == null){
            day.startTime = "Closed";
            day.endTime = "";
        }
        else{
            let tfhour = Number(day.startTime.split(':')[0]);
            let minute = day.startTime.split(':')[1];
            let ap = 'AM';
            if(tfhour >= 12){
                ap = 'PM';
                tfhour = tfhour - 12;
            }
            if(tfhour == 0){
                tfhour = 12;
            }
            day.startTime = `${tfhour}:${minute}${ap}`;

            let tfhoure = Number(day.endTime.split(':')[0]);
            let minutee = day.endTime.split(':')[1];
            let ape = 'AM';
            if(tfhoure >= 12){
                ape = 'PM';
                tfhoure = tfhoure - 12;
            }
            if(tfhoure == 0){
                tfhoure = 12;
            }
            day.endTime = `${tfhoure}:${minutee}${ape}`;
        }
    }
    return newHours;
}