import { ObjectId } from "mongoose";
import { BOMPlanningCreate, PlanningCreateObject } from "../../interfaces/planningInterface";
import PlanningBOMModel from "../models/planningBOMModel";
import PlanningAssemblyLineModel from "../models/planningAssemblyLineModel";

class PlanningRepo {
    constructor() { }
    public async createBomPlanning(planningObject: BOMPlanningCreate) {
        try {
            const planning = await PlanningBOMModel.create(planningObject);
            return planning.toObject();
        } catch (error) {
            throw new Error(`Error while creating planning bom`);
        }
    }
    public async getBOMsPlanning(page: number, offset: number) {
        try {
            const skip = (page - 1) * offset;
            const bomPlanning = await PlanningBOMModel.find()
                .populate("bomId")
                .populate("planningLines")
                .skip(skip)
                .limit(offset)
                .lean();
            const countDocuments = await PlanningBOMModel.countDocuments();
            return { bomPlanning, countDocuments };
        } catch (error) {
            throw new Error(`Error while getting BOM planning: ${error}`);
        }
    }
    public async getPartNumberByBomsPlanningById(id: ObjectId) {
        try {
            const planningModel = await PlanningBOMModel.aggregate([
                {
                    $match: { _id: id }
                },
                {
                    $lookup: {
                        from: "planning_assembly_line",
                        localField: "planningLines",
                        foreignField: "_id",
                        as: "partNumbers"
                    }
                },
                {
                    $unwind: "$partNumbers"
                },
                {
                    $group: {
                        _id: null,
                        partNumbersIds: { $addToSet: "$partNumbers.partNumber" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        partNumbersIds: 1
                    }
                }
            ]);
            return planningModel[0]?.partNumbersIds ?? [];
        } catch (error) {
            throw new Error(`Error while getting BOM planning by Id: ${error}`);
        }
    }
    public async pushAssemblyLine(assemblyLinePlanning: ObjectId, bomPlanning: ObjectId) {
        try {
            const updatePlanning = await PlanningBOMModel.findByIdAndUpdate(
                bomPlanning,
                {
                    $push: { planningLines: assemblyLinePlanning }
                },
                { new: true }
            );

            return updatePlanning;
        } catch (error) {
            console.error("Error pushing assembly line to planning BOM:", error);
            throw error;
        }
    }
    public async createAsssemblyLine(planningLineObject: PlanningCreateObject) {
        try {
            const assemblyLine = await PlanningAssemblyLineModel.create(planningLineObject);
            return assemblyLine;
        } catch (error) {
            throw new Error(`Error while creating planning line`);
        }
    }
}

export default PlanningRepo;