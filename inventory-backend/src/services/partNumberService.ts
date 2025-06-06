import PartNumberRepository from "../database/repositories/partNumberRepository";
import { Request, Response } from "express";
import * as XLSX from "xlsx";
import fs from "fs";
import { PartNumberCreationInterface } from "../interfaces/partNumberInterface";

class PartNumberService {
    private partNumberRepo: PartNumberRepository
    constructor() {
        this.partNumberRepo = new PartNumberRepository();
    }
    public async createPartNumbers(req: Request, res: Response) {
        if (!req.file) {
            return res.sendError("File is missing", "File is not send", 400);
        }
        try {
            const workbook = XLSX.readFile(req.file.path);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(sheet);
            fs.unlink(req.file.path, (err) => {
                if (err) console.log("File Deletion Failed:", err);
            })
            const formattedData: PartNumberCreationInterface[] = sheetData.map((row: any) => ({
                name: row["Name"],
                description: row["Description"],
                in_stock: Number(row["In Stock Quantity"]),
                reorder_qty: Number(row["Re Order Level"]),
            }));
            const { partNumbers, updated } = await this.partNumberRepo.createpartNumbers(formattedData);
            return res.sendArrayFormatted(partNumbers, `Created Part Numbers ${partNumbers.length} and updated ${updated} part number`, 200);
        } catch (error) {
            return res.sendError(error, "Error while creating part Numbers", 500);
        }
    }
    public async getPartNumber(req: Request, res: Response) {
        try {
            const page = parseInt(req.params.page || "1", 10);
            const offset = parseInt(req.params.offset || "10", 10);
            const search = (req.query.search as string | undefined)?.trim();
            const { partNumbers, count } = await this.partNumberRepo.getPartNumbers(page, offset, search);

            return res.sendArrayFormatted(partNumbers, `${count} Part Numbers  Fetched`, 200);
        } catch (error) {
            console.error(error);
            return res.sendError(error, "Error while getting Part Numbers", 500);
        }
    }
    public async deletePartNumberByID(req: Request, res: Response) {
        try {
            const id: any = req.params.id;
            if (!id) {
                console.log("Id not found");
            }
            const partNumberDelete = await this.partNumberRepo.deletePartNumberById(id);
            return res.sendFormatted(partNumberDelete, "Deleted Part Number", 201);
        } catch (error) {
            return res.sendError(error, "Error while deleting Part Number", 400);
        }
    }
    public async partNumberBySearch(req: Request, res: Response) {
        try {
            const search: any = (req.query.search as string | undefined);
            const partNumbers = await this.partNumberRepo.getPartNumberBySearch(search);
            return res.sendArrayFormatted(partNumbers,"Fetched Part Numbers",200);
        } catch (error) {
            return res.sendError(error,"Error while getting partNumber");
        }
    }
}
export default PartNumberService;