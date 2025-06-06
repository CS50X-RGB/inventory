import { RoleInterface } from "../interfaces/roleInterface";
import RoleRepository from "../database/repositories/roleRepository";
import { Response, Request } from "express";

class RoleService {
    private roleRepository: RoleRepository;
    constructor() {
        this.roleRepository = new RoleRepository();
    }
    public async createRole(req: Request, res: Response) : Promise<any | null> {
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
    public async getRoles(req: Request, res: Response) {
        try {
            const search = req.query.search as string | undefined;
            console.log(search, "search");

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
