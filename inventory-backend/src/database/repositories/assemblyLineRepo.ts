import { ObjectId } from "mongoose";
import { AssemblyLineCreate } from "../../interfaces/assemblyLineInterface";
import AssemblyLineModel from "../models/assemblyLineModel";

class AssemblyLineRepo {
    constructor() { }
    public async createAssemblyLine(assemblyObj: AssemblyLineCreate) {
        try {
            const assemblyObject = await AssemblyLineModel.create(assemblyObj);
            return assemblyObject.toObject();
        } catch (error) {
            throw new Error(`Error while creating Assembly Line`);
        }
    }
    public async getSubAssemblyById(assemblyId: ObjectId) {
        try {
            const assemblyLine = await AssemblyLineModel.findById(assemblyId)
                .populate("uom")
                .populate("partNumber");

            if (assemblyLine?.child_id && assemblyLine?.child_id?.length > 0) {
                await assemblyLine.populate({
                    path: "child_id",
                    populate: [
                        { path: "uom" },
                        { path: "partNumber" }
                    ]
                });
            }

            return assemblyLine?.toObject();
        } catch (error) {
            throw new Error(`Error while fetching Assembly Line`);
        }
    }

    public async pushChilds(childId: ObjectId, assemblyId: ObjectId) {
        try {
            const parentAssemblyId = await AssemblyLineModel.findByIdAndUpdate(assemblyId,
                {
                    $push: { child_id: childId }
                },
                { new: true }
            );
            return parentAssemblyId?.toObject();
        } catch (error) {
            throw new Error(`Error while adding child sub assembly`);
        }
    }
    public async deleteAsseblyLine(assemblyId: ObjectId) {
        try {
            const assemblyLineObject = await AssemblyLineModel.findByIdAndDelete(assemblyId).lean();
            return assemblyLineObject;
        } catch (error) {
            throw new Error(`Error while fetching Assembly Line`);
        }
    }
    public async deleteSubAssembly(assemblyIds : any){
        try {
            const assemblyLines = await AssemblyLineModel.deleteMany({
                _id : { $in : assemblyIds }
            });
            return assemblyLines;
        } catch (error) {
            console.error("Error while deleting assemblylines",error);
            return null;
        }
    }
    public async getAllChildrenFlat(subAssemblyById: ObjectId, qty: any): Promise<any[]> {
        const allChildren: any[] = [];

        try {
            const parent = await AssemblyLineModel.findById(subAssemblyById).populate("uom").populate("partNumber");
            if (!parent) return [];
            const raw = parent.toObject();
            const finalObject = {
                ...raw,
                total_qty: raw.required_qty * Number(qty.qty),
                total_price: raw.unit_cost * Number(qty.qty),
            };

            allChildren.push(finalObject);

            if (raw.child_id && raw.child_id.length > 0) {
                for (const childId of raw.child_id) {
                    const children = await this.getAllChildrenFlat(childId, qty);
                    allChildren.push(...children);
                }
            }
        } catch (error) {
            console.error("Error fetching children:", error);
            throw error;
        }

        return allChildren;
    }
    public async getSubAssemblyByName(name: string): Promise<any | null> {
        try {
            const assemblyLine = await AssemblyLineModel
                .findOne({ name })
                .sort({ createdAt: -1 }); 
            return assemblyLine;
        } catch (error) {
            throw Error(`Error while getting assembly line`);
        }
    }

    public async getBOMIdByLevel(assemblyId: ObjectId): Promise<ObjectId | null> {
        try {
            const bomObject = await AssemblyLineModel.findById(assemblyId);
            console.log(bomObject?.level, "Level of bomObject");
            if (!bomObject) return null;
            if (bomObject.level === 1) {
                return bomObject.parent_id;
            } else if (bomObject.level > 1) {
                return this.getBOMIdByLevel(bomObject.parent_id);
            }
            return null;
        } catch (error) {
            console.error("Error in getBOMIdByLevel:", error);
            return null;
        }
    }

}

export default AssemblyLineRepo;