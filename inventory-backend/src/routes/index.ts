import { Router } from 'express';
import roleRouter from "./roleRoute"
import userRouter from "./userRoute"
import partNumberRouter from "./partNumberRoute";
import bomRouter from "./bomRoute";
import uomRouter from "./uomRoute";
import analyticsRouter from "./analyticsRoute";

const router = Router();
const version = "v1";
const webRoute = "web";
export const prefix = `/${version}/${webRoute}`;

router.use(`${prefix}/role`, roleRouter);
router.use(`${prefix}/user`, userRouter);
router.use(`${prefix}/part`, partNumberRouter);
router.use(`${prefix}/bom`,bomRouter);
router.use(`${prefix}/uom`,uomRouter);
router.use(`${prefix}/analytics`,analyticsRouter);

export default router;
