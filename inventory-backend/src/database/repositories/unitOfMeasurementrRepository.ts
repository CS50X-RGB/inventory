import { RoleInterface } from "../../interfaces/roleInterface";
import UOMModel from "../models/unitOfMeasurementModel";

class UOMRepo {
    constructor() { }

    public async createUOMS(units: RoleInterface[]): Promise<any | null> {
        try {
            const createdUOMs = await UOMModel.insertMany(units);
            return createdUOMs;
        } catch (error) {
            console.error("Error creating UOMs:", error);
            return null;
        }
    }
    public async createUOM(unit: RoleInterface): Promise<any | null> {
        try {
            const createdUOM = await UOMModel.create(unit);
            return createdUOM.toObject();
        } catch (error) {
            console.error("Error creating UOMs:", error);
            return null;
        }
    }
    public async findUOMByName(name: string): Promise<boolean> {
        try {
            const uom = await UOMModel.findOne({ name }).lean();
            return uom ? true : false;
        } catch (e) {
            return false;
        }
    }
    public async deleteUOM(name: string): Promise<RoleInterface | null> {
        try {
            const uom = await UOMModel.findOneAndDelete({ name }).lean();
            return uom;
        } catch (e) {
            throw new Error(`New Error while deleting role ${e}`);
        }
    }
    public async getUOMBySearch(name: string): Promise<any | null> {
        try {
            let query = {};

            if (name && name.trim() !== "") {
                query = {
                    name: { $regex: new RegExp(name.trim(), "i") },
                };
            }
            const uoms = await UOMModel.find(query);
            return uoms;
        } catch (error) {
            throw new Error(`Error while getting all UOMs`);
        }
    }
    public async getUOMIdByName(name: string): Promise<any | null> {
        try {
            const uom = await UOMModel.findOne({
                name: name
            });
            return uom;
        } catch (error) {
            throw Error('Error while getting UOM by name');
        }
    }
}

export default UOMRepo;
