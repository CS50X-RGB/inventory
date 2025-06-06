import express from 'express';
import connectDB from './database/connection';
import routes from './routes'
import cors from 'cors';
import { responseFormatter } from './utils/reponseFormatter';
import UserService from './services/userService';
import RoleService from './services/roleService';
import { RoleInterface } from './interfaces/roleInterface';
import UOMService from './services/uomService';
const app = express();


app.use(cors({
   origin: ['http://localhost:3000', 'https://inventory-r6r4.vercel.app'],
   methods: ['GET', 'POST', 'PUT', 'DELETE'],
   credentials: true
}));


app.use(express.json());
app.use(responseFormatter);
app.use('/api', routes);

connectDB();

const roles: RoleInterface[] = [
   {
      "name": "ADMIN",
   }
]
const uoms: RoleInterface[] = [
   {
      "name": "Inches"
   },
   {
      "name": "Pieces"
   }
]
const userService = new UserService();
const roleService = new RoleService();
const uomService = new UOMService();

uomService.createUOMS(uoms);
roleService.createRoles(roles);
userService.createAdmin();

export default app;
