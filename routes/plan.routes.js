import express from 'express';
import { createPlan,  getAllPlans, getPlanById, updatePlan, deletePlan, checkout, paymentVerification} from '../controllers/plan.controller.js';
const planRouter = express.Router();
import { AdminUserGuard, UserGuard } from '../middlewares/user.middlewares.js';

planRouter.post('/', createPlan);
planRouter.post('/checkout/:id', AdminUserGuard, checkout);
planRouter.post('/payment/verify/:id', AdminUserGuard, paymentVerification);
planRouter.get('/', getAllPlans);
planRouter.get('/:id', getPlanById);
planRouter.put('/:id', updatePlan);
planRouter.delete('/:id', deletePlan);

export default planRouter;
