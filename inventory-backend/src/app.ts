import express from 'express';
import connectDB from './database/connection';
import routes from './routes'
import cors from 'cors';
import { responseFormatter } from './utils/reponseFormatter';
import UserService from './services/userService';
import RoleService from './services/roleService';
import { RoleInterface } from './interfaces/roleInterface';
import UOMService from './services/uomService';
import { PermissionCreate } from './interfaces/permissionInterface';
const app = express();


app.use(cors({
   origin: ['http://localhost:3000', 'https://inventory-r6r4.vercel.app', 'http://69.62.74.187:3000', 'https://inventory.swyftcore.in'],
   methods: ['GET', 'POST', 'PUT', 'DELETE'],
   credentials: true
}));


app.use(express.json());
app.use(responseFormatter);
app.use('/api', routes);

connectDB();

const permissions: PermissionCreate[] = [
   {
      name: "Dashboard",
      link: "/admin/"
   },
   {
      name: "Import Part Number",
      link: "/admin/import/",
   }, {
      name: "Create Users",
      link: "/admin/create"
   },
   {
      name: "View Part Numbers",
      link: "/admin/view"
   },
   {
      name: "Create BOM",
      link: '/admin/bom/create'
   },
   {
      name: "View BOMS",
      link: "/admin/bom/view"
   },
   {
      name: "Plan Top Levels",
      link: "/admin/bom/plan/single"
   },
   {
      name: "Import Top Levels",
      link: "/admin/bom/import"
   },
   {
      name: "View Planning History",
      link: "/admin/planning/all"
   },
   {
      name: "Select Top Level",
      link: "/admin/bom/plan/multi"
   },
   {
      name: "View History",
      link: "/admin/planning/all/history"
   }
];

const roles: RoleInterface[] = [
   {
      "name": "ADMIN",
   },
   {
      "name": "PLANNER"
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
roleService.createPermission(permissions);
userService.createAdmin();

export default app;
