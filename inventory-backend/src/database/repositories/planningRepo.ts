import { ObjectId, Types } from "mongoose";
import { BOMPlanningCreate, PlanningCreateObject, PlanningTransactionBOMInterface, PlanningTransactionLineInterface } from "../../interfaces/planningInterface";
import PlanningBOMModel from "../models/planningBOMModel";
import PlanningAssemblyLineModel from "../models/planningAssemblyLineModel";
import mongoose from "mongoose";
import TransactionLineModel from "../models/transactionLineModel";
import TransactionParentModel from "../models/transactionParentModel";

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

    public async getPlanningAssemblyLines(id: ObjectId, qty: number) {
        try {
            const fixedId = new mongoose.Types.ObjectId(id.toString());

            const step5 = await PlanningBOMModel.aggregate([
                { $match: { _id: fixedId } },

                {
                    $addFields: {
                        planningLines: {
                            $map: {
                                input: "$planningLines",
                                as: "lineId",
                                in: { $toObjectId: "$$lineId" }
                            }
                        }
                    }
                },

                {
                    $lookup: {
                        from: "planning_assembly_lines",
                        localField: "planningLines",
                        foreignField: "_id",
                        as: "planningLinesData"
                    }
                },

                { $unwind: "$planningLinesData" },

                {
                    $addFields: {
                        "planningLinesData.assemblyLine": {
                            $toObjectId: "$planningLinesData.assemblyLine"
                        }
                    }
                },

                {
                    $lookup: {
                        from: "assemblylines",
                        localField: "planningLinesData.assemblyLine",
                        foreignField: "_id",
                        as: "assemblyLine"
                    }
                },

                { $unwind: "$assemblyLine" },
                {
                    $addFields: {
                        total: {
                            $multiply: [
                                { $toInt: "$assemblyLine.required_qty" },
                                Number(qty)
                            ]
                        }
                    }
                },
                {
                    $project: {
                        planningLineId: "$assemblyLine._id",
                        partNumber: "$assemblyLine.partNumber",
                        assemblyLine: "$assemblyLine._id",
                        total: 1
                    }
                }
            ]);

            return step5;
        } catch (error) {
            console.error("❌ Aggregation Error:", error);
            throw error;
        }
    }
    public async getBomIdByPlanningParent(id: ObjectId) {
        try {
            const bomDoc = await PlanningBOMModel.findById(id).lean();
            return bomDoc?.bomId;
        } catch (error) {
            console.error("Error in getBomIdByPlanningParent:", error);
            throw new Error("Error while getting BOM from planning parent");
        }
    }

    public async updateBomPlanning(id: ObjectId, qty: number) {
        try {
            const findBomPlanning = await PlanningBOMModel.findOneAndUpdate(
                { _id: id },
                {
                    $inc: { qty: -qty }
                },
                { new: true }
            );

            if (findBomPlanning && findBomPlanning.qty <= 0) {
                await PlanningAssemblyLineModel.deleteMany({
                    _id: { $in: findBomPlanning.planningLines }
                });
                await PlanningBOMModel.findOneAndDelete({ _id: id });

                return true;
            }

            return true;
        } catch (error) {
            throw error;
        }
    }

    public async updatePlanningEntites(id: ObjectId, qty: number, bomId: ObjectId) {
        try {
            const updatePlanningEntity = await PlanningAssemblyLineModel.findOneAndUpdate(
                { _id: id },
                {
                    $inc: { qty: -qty }
                },
                { new: true }
            );
            if (updatePlanningEntity && updatePlanningEntity.qty <= 0) {

                await PlanningAssemblyLineModel.findOneAndDelete(id);

                const updatedBom = await PlanningBOMModel.findByIdAndUpdate(
                    bomId,
                    { $pull: { planningLines: id } },
                    { new: true }
                );
                if (updatedBom && updatedBom.planningLines.length == 0) {
                    await PlanningBOMModel.findByIdAndDelete(bomId);
                }
                return true;
            }
            return true;
        } catch (error) {
            throw error;
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

    public async createTransactionLine(createTransactionLine: PlanningTransactionLineInterface) {
        try {
            const createTransactionLineObject = await TransactionLineModel.create(createTransactionLine);
            return createTransactionLineObject.toObject();
        } catch (error) {
            console.log(error);
            throw new Error(`Error while creating transaction planning line`);
        }
    }
    public async pushLineTransaction(transactionChildId: ObjectId, parentModelId: any) {
        try {
            const updateParentTransaction = await TransactionParentModel.findByIdAndUpdate(
                parentModelId,
                {
                    $push: {
                        child_planning_transaction: transactionChildId
                    }
                },
                { new: true }
            );
            return updateParentTransaction;
        } catch (error) {
            console.error("Failed to push child transaction:", error);
            throw error;
        }
    }
    public async createTransactionParent(planningParentObject: PlanningTransactionBOMInterface) {
        try {
            const createParent = await TransactionParentModel.create(planningParentObject);
            return createParent.toObject();
        } catch (error) {
            throw new Error(`Error while creating parent model`)
        }
    }
    public async getTransactionByBomId(bomId: ObjectId) {
        try {
            const getTransactions = await TransactionParentModel.find({
                bomId,
            })
                .populate("child_planning_transaction")
                .lean();
            return getTransactions;
        } catch (error) {
            throw new Error(`Error while getting Transactions`);
        }
    }
    public async getTransactions(page: number, offset: number, status: any) {
        try {
            const filter: any = {};
            if (status !== 'all' && status !== 'null') {
                filter.status = status;
            }
            console.log(filter,"status")
            const totalCount = await TransactionParentModel.find(filter)
                .lean().countDocuments();

            const getTransactions = await TransactionParentModel.find(filter)
                .populate("bomId")
                .populate("child_planning_transaction")
                .skip((page - 1) * offset)
                .limit(offset)
                .lean();

            return { getTransactions, totalCount };
        } catch (error) {
            console.error("Error in getTransactions:", error);
            throw new Error("Error while getting Transactions");
        }
    }
}

export default PlanningRepo;