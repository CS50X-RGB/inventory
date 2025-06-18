import Role from "../models/roleModel"
import { RoleInterface, RoleInterfaceGet } from "../../interfaces/roleInterface";
import mongoose from "mongoose";


class RoleRepository {
  public async createRole(role: RoleInterface): Promise<RoleInterface | null> {
    try {
      const newRole = await Role.create(role);
      return newRole;
    } catch (e) {
      throw new Error(`New Error while creating role ${e}`);
    }
  }
  public async findRoleByName(name: string): Promise<boolean> {
    try {
      const role = await Role.findOne({ name }).lean();
      return role ? true : false;
    } catch (e) {
      return false;
    }
  }
  public async deleteRole(name: string): Promise<RoleInterface | null> {
    try {
      const role = await Role.findOneAndDelete({ name }).lean();
      return role;
    } catch (e) {
      throw new Error(`New Error while deleting role ${e}`);
    }
  }
  public async getIdByRole(name: string): Promise<any | null> {
    try {
      const role = await Role.findOne({ name }).lean();
      return role;
    } catch (e) {
      throw new Error(`Error while getting role ${name}`);
    }
  }
  public async getAll(): Promise<any[]> {
    try {
      const roles = await Role.find();
      return roles;
    } catch (e) {
      throw new Error("Error while getting roles");
    }
  }

  public async findByPreifx(prefix: string) {
    try {
      const regex = new RegExp(`^${prefix}`, 'i');
      return await Role.find({ name: regex }).lean();
    } catch (error) {
      throw new Error(`Error while searching roles`);
    }
  }

  public async togglePermission(roleId: any, permissionId: any[]) {
    try {
      const role = await Role.findById(roleId);

      if (!role) {
        throw new Error("Role not found");
      }
      const toAdd: any[] = [];
      const toRemove: any[] = [];
      permissionId.forEach((permId: any) => {
        const objectId = new mongoose.Types.ObjectId(permId);
        const exists = role.permissions.some((p: any) => p.equals(objectId));
        if (exists) {
          toRemove.push(objectId);
        } else {
          toAdd.push(objectId);
        }
      });
      if (toAdd.length > 0) {
        await Role.findByIdAndUpdate(roleId, {
          $addToSet: { permissions: { $each: toAdd } },
        });
      }
      console.log(toAdd,"To Add");
      if (toRemove.length > 0) {
        await Role.findByIdAndUpdate(roleId, {
          $pull: { permissions: { $in: toRemove } },
        });
      }
      console.log(toRemove,"remove");



      const updatedRole = await Role.findById(roleId);
      console.log(updatedRole);
      return updatedRole;
    } catch (error) {
      console.error("Error while toggling permission:", error);
      throw new Error("Failed to toggle permission for role");
    }
  }


}

export default RoleRepository;
