import { RoleInterface } from "../interfaces/roleInterface";
import RoleRepository from "../database/repositories/roleRepository";
import { Response, Request } from "express";
import { PermissionCreate } from "../interfaces/permissionInterface";
import PermissionRepo from "../database/repositories/permissionRepo";

class RoleService {
    private roleRepository: RoleRepository;
    private permissionRepository: PermissionRepo;
    constructor() {
        this.roleRepository = new RoleRepository();
        this.permissionRepository = new PermissionRepo();
    }
    public async createRole(req: Request, res: Response): Promise<any | null> {
        try {
            console.log("createRole endpoint hit with body:", req.body);

            const role: RoleInterface = req.body;

            const existingRole = await this.roleRepository.findRoleByName(role.name);
            if (existingRole) {
                console.log("Role already exists:", role.name);
                return res.sendError(null, "Role Already Exists", 400);
            }

            let newRole = await this.roleRepository.createRole(role);


            console.log("Role created successfully:", newRole);
            return res.sendFormatted(newRole, "Role Created", 200);
        } catch (e: any) {
            console.error("Error while creating role:", e);
            return res.sendError(null, "Error while creating role", 400);
        }
    }
    public async getRoleId(req: Request, res: Response) {
        try {
            const { name } = req.params;
            const role = await this.roleRepository.getIdByRole(name);
            console.log(`Role ${role}`);
            return res.sendFormatted(role);
        } catch (error) {
            return res.sendError(null, "Error while getting the role", 400);
        }
    }
    public async deleteRole(req: Request, res: Response) {
        try {
            const { name }: RoleInterface = req.body;
            const deleteRole = await this.roleRepository.deleteRole(name);
            return res.sendFormatted(deleteRole);
        } catch (e) {
            throw new Error(`Error while deleting role`);
        }
    }
    public async createRoles(names: RoleInterface[]): Promise<void> {
        try {
            for (const role of names) {
                const existingRole = await this.roleRepository.findRoleByName(role.name);
                if (existingRole) {
                    console.log(`Role '${role.name}' already exists`);
                } else {
                    await this.roleRepository.createRole(role);
                    console.log(`Role '${role.name}' created successfully`);
                }
            }
        } catch (error: any) {
            console.error('Error while creating roles:', error.message);
        }
    }


    public async createPermission(permissions: PermissionCreate[]) {
        try {
            for (const permission of permissions) {
                const existingRole = await this.permissionRepository.findPermissionByName(permission.name);
                if (existingRole) {
                    console.log(`Permission '${permission.name}' already exists`);
                } else {
                    await this.permissionRepository.createPermission(permission);
                    console.log(`Permision '${permission.name}' created successfully`);
                }
            }
        } catch (error: any) {
            console.error('Error while creating Permission:', error.message);
        }
    }
    public async updatePermissions(req : Request,res : Response){
        try {
            const { roles } : any = req.body;
            const result = [];
            for(const roleId of Object.keys(roles)){
                const permissions = roles[roleId];
                const updatedRole = await this.roleRepository.togglePermission(roleId,permissions);
                result.push(updatedRole);
            }
            return res.sendArrayFormatted(result,"Updated Result",200);
        } catch (error) {
            return res.sendError(error,"Error while updating the permissions",400);
        }
    }
    public async getPermissions(req: Request,res : Response){
        try {
            const getAllPermission = await this.permissionRepository.getPermissions();
            return res.sendArrayFormatted(getAllPermission,"Fetched All Permissions",200);
        } catch (error) {
            return res.sendError(error,"Error while getting permission",400);
        }
    }

    public async getRoles(req: Request, res: Response) {
        try {
            const search = req.query.search as string | undefined;

            let roles = await this.roleRepository.getAll();
            if (search && search.length > 0) {
                roles = await this.roleRepository.findByPreifx(search);
                console.log(roles, "Inside here");
            }
            return res.sendArrayFormatted(roles, "Roles Fetched", 200);
        } catch (e) {
            return res.sendError(e, "Error while getting the roles", 400);
        }
    }

    
}

export default RoleService;
