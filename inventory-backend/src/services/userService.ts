import RoleRepository from "../database/repositories/roleRepository";
import UserRepository from "../database/repositories/userRepository";
import { ADMIN_EMAIL, ADMIN_USER, ADMIN_PASS } from "../config/config";
import { IUserCreate, IUserCreateReturn, IUserLogin,IUserSignin } from "../interfaces/userInterface";
import { createToken, hashPassword, isMatch } from "../helpers/encrypt";
import { Response, Request } from "express";

class UserService {
    private userRepository: UserRepository;
    private roleRepository: RoleRepository;
    constructor() {
        this.userRepository = new UserRepository();
        this.roleRepository = new RoleRepository();
    }
    public async createAdmin(): Promise<void> {
        try {
            const role = await this.roleRepository.getIdByRole("ADMIN");
            if (role) {
                const hashedPassword = await hashPassword(ADMIN_PASS);
                const needAdmin = await this.userRepository.getUserByRole(role._id);
                if (!needAdmin) {
                    const user = {
                        name: ADMIN_USER,
                        password: hashedPassword,
                        email: ADMIN_EMAIL,
                        role: role._id
                    }
                    const newUser = await this.userRepository.createUser(user);
                    console.log(`Admin is Created with name ${newUser?.name}`);
                } else {
                    console.log(`Admin already exists`);
                }
            } else {
                console.log(`Admin creation failed`);
            }
        } catch (error: any) {
            throw new Error(`Error in Admin creation`);
        }
    }
    public async login(req: Request, res: Response) {
        try {
            const user: IUserLogin = req.body;
            const userDetails: IUserCreateReturn | null = await this.userRepository.getUserByName(user.name);
            if (!userDetails) {
                return res.sendError(null, "User Not found", 400);
            } else {
                const matchPassword = await isMatch(user.password, userDetails.password);
                if (!matchPassword) {
                    return res.sendError(null, "Wrong password", 400);
                }
                const accessToken = createToken({
                    _id: userDetails._id,
                    role: userDetails.role.name,
                    name: userDetails.name,
                    email: userDetails.email
                });
                const userResponse = {
                    name: userDetails.name,
                    email: userDetails.email,
                    isBlocked: userDetails.isBlocked,
                    role: userDetails.role.name,
                    token: accessToken
                }
                return res.sendFormatted(userResponse, "User Details", 200);
            }
        } catch (e) {
            throw new Error(`Error in Login`);
        }
    }
    public async signUpUser(req: Request, res: Response) {
        try {
            const user: IUserSignin = req.body;

            const existingUserByEmail = await this.userRepository.getUserByEmail(user.email);
            if (existingUserByEmail) {
                return res.sendError(null, "User with this email already exists", 400);
            }

            const hashedPassword = await hashPassword(user.password);

            const userObj = {
                name: user.name,
                password: hashedPassword,
                email: user.email,
                role: user.role,
            };

            const newUser: any = await this.userRepository.createUserWithToken(userObj);

            if (!newUser) return res.sendError(null, "User Not created", 400);

            const accessToken = createToken({
                _id: newUser._id,
                role: newUser.role.name,
                name: newUser.name,
                email: newUser.email,
            });
            const userResponse = {
                name: newUser.name,
                email: newUser.email,
                isBlocked: newUser.isBlocked,
                role: newUser.role.name,
                token: accessToken
            }
            return res.sendFormatted({ user: userResponse }, "User Created", 200);

        } catch (error) {
            console.error("Signup Error:", error);
            return res.sendError(error, "Error creating user", 500);
        }
    }

    public async createUser(req: Request, res: Response) {
        try {
            const user: IUserCreate = req.body;
            const userDetails: IUserCreateReturn | null = await this.userRepository.getUserByName(user.name);
            const userEmail: IUserCreateReturn | null = await this.userRepository.getUserByEmail(user.email);
            if (!userDetails && userEmail == null) {
                const hashedPassword = await hashPassword(user.password);
                const userObj: IUserCreate = {
                    _id: user._id,
                    name: user.name,
                    password: hashedPassword,
                    email: user.email,
                    role: user.role,
                }
                const newUser = await this.userRepository.createUser(userObj);
                return res.sendFormatted(newUser, "User Created", 200);
            } else {
                return res.sendError(null, "User Already exists", 400);
            }
        } catch (error) {
            throw new Error(`Error creating user`);
        }
    }
    public async getProfile(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.sendError(null, "User not found", 400);
            }
            const userId = req.user._id;
            const user = await this.userRepository.getUserById(userId);
            return res.sendFormatted(user, "User Details", 200);
        } catch (error) {
            throw new Error(`Error getting user ${error}`);
        }
    }
    public async updateIsBlocked(req: Request, res: Response) {
        try {
            const userId: any = req.params.id;
            const userUpdated = await this.userRepository.updateUserIsBlocked(userId);
            return res.sendFormatted(userUpdated, "User Status updated", 200);
        } catch (error) {
            return res.sendError(error, "Error while getting users", 400);
        }
    }
    public async getAllUsers(req: Request, res: Response) {
        try {
            const pageParam = req.query.page as string | undefined;
            const offsetParam = req.query.offset as string | undefined;
            const page = pageParam ? parseInt(pageParam) : undefined;
            const offset = offsetParam ? parseInt(offsetParam) : undefined;
            let users;
            if (page && offset) {
                const skip = (page - 1) * offset;
                users = await this.userRepository.getAllUsersPaginated(skip, offset);
            } else {
                users = await this.userRepository.getAllUser();
            }
            return res.sendArrayFormatted(users, "Fetched All Users", 200);
        } catch (error) {
            return res.sendError(error, "Error while getting users", 400);
        }
    }

    public async deleteById(req: Request, res: Response) {
        try {
            const { id }: any = req.params;
            const user = await this.userRepository.deleteUser(id);
            res.sendFormatted(user, "User Deleted", 204);
        } catch (error) {
            throw new Error(`Error while deleting user`);
        }
    }
}


export default UserService;
