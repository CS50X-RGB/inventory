import { PartNumberCreationInterface } from "../../interfaces/partNumberInterface";
import PartNumberModel from "../models/partNumberModel";
import { ObjectId } from "mongoose";

class PartNumberRepository {
    constructor() { }
    public async createpartNumbers(partNumberObjects: PartNumberCreationInterface[]) {
        try {
            let objs = [];
            let updateCnt = 0;
            for (const partNumber of partNumberObjects) {
                const existing = await PartNumberModel.findOne({
                    name: partNumber.name,
                    description: partNumber.description
                });
                if (existing) {
                    const needsUpdate =
                        existing.in_stock !== partNumber.in_stock ||
                        existing.reorder_qty !== partNumber.reorder_qty;
                    if (needsUpdate) {
                        existing.in_stock = partNumber.in_stock;
                        existing.reorder_qty = partNumber.reorder_qty;
                        existing.save();
                        updateCnt++;
                    }
                }

                if (!existing) {
                    objs.push(partNumber);
                }
            }
            if (objs.length > 0) {
                const createInsert = await PartNumberModel.insertMany(objs);
                objs = createInsert.map((p: any) => p.toObject());
            }
            return {
                partNumbers: objs,
                updated: updateCnt
            };
        } catch (error) {
            throw Error('Error while creating bulk Part Numbers');
        }
    }
    public async createPartNumber(partNumberObject: PartNumberCreationInterface) {
        try {
            const partNumber = await PartNumberModel.create(partNumberObject);
            return partNumber.toObject();
        } catch (error) {
            throw new Error(`Error while creating part Number`);
        }
    }
    public async deletePartNumbers(ids: ObjectId[]) {
        try {
            const results = await PartNumberModel.deleteMany({
                _id: { $in: ids }
            });
            return results.deletedCount;
        } catch (error) {
            throw Error('Error while deleting bulk Part Numbers');
        }
    }
    public async deletePartNumberById(id: ObjectId) {
        try {
            const result = await PartNumberModel.findByIdAndDelete(id);
            return result;
        } catch (error) {
            throw Error(`Error delete the part number`);
        }
    }
    public async getPartNumbers(page: number, offset: number, search?: string) {
        try {
            const skip = (page - 1) * offset;
            const query: any = {};
            if (search) {
                query.name = { $regex: search, $options: 'i' };
            }
            const partNumber = await PartNumberModel.find(query).skip(skip).limit(offset).lean();
            let count = await PartNumberModel.countDocuments();
            if (search) {
                count = await PartNumberModel.countDocuments(query);
            }
            return {
                partNumbers: partNumber,
                count
            };
        } catch (error) {
            throw Error('Error while deleting bulk Part Numbers');
        }
    }
    public async getPartNumberBySearch(name: string): Promise<any[]> {
        try {
            let query = {};

            if (name && name.trim() !== "") {
                query = {
                    name: { $regex: new RegExp(name.trim(), "i") },
                };
            }

            const partNumbers = await PartNumberModel.find(query);
            return partNumbers;
        } catch (error) {
            throw new Error(`Error while getting Part Numbers`);
        }
    }
    public async getPartNumberIdByName(name: string): Promise<any | null> {
        try {
            const partNumber = await PartNumberModel.findOne({
                name: name
            });
            return partNumber;
        } catch (error) {
            throw Error('Error while getting  Part Number by name');
        }
    }
    public async lockPartNumber(partNumberId: ObjectId, qty: number): Promise<any | null> {
        try {
            const updatePartNumber = await PartNumberModel.findByIdAndUpdate(
                partNumberId,
                {
                    $inc: {
                        locked_qty: qty,
                        in_stock: -qty,
                    },
                },
                { new: true }
            );
            return updatePartNumber;
        } catch (error) {
            console.error("Error locking part number:", error);
            throw error;
        }
    }
    public async realsePartNumber(partNumberId: ObjectId, qty: number): Promise<any | null> {
        try {
            const updatePartNumber = await PartNumberModel.findByIdAndUpdate(
                partNumberId,
                {
                    $inc: {
                        locked_qty: -qty,
                        in_stock: qty,
                    },
                },
                { new: true }
            );
            return updatePartNumber;
        } catch (error) {
            console.error("Error locking part number:", error);
            throw error;
        }
    }
}

export default PartNumberRepository;