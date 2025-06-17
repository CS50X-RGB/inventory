import { PermissionCreate } from "../../interfaces/permissionInterface";
import PermisssionModel from "../models/permisssionModel";

class PermissionRepo {
    constructor() { }
    public async createPermission(permission: PermissionCreate) {
        try {
            const newPermission = await PermisssionModel.create(permission);
            return newPermission.toObject();
        } catch (error) {
            throw new Error(`Error while getting error`);
        }
    }
    public async getPermissions() {
        try {
            const getAllPermission = await PermisssionModel.find().lean();
            return getAllPermission;
        } catch (error) {
            throw new Error(`Error while getting permissions`);
        }
    }

    public async findPermissionByName(name: string): Promise<boolean> {
        try {
            const permission = await PermisssionModel.findOne({ name }).lean();
            return permission ? true : false;
        } catch (e) {
            return false;
        }
    }
}

export default PermissionRepo;