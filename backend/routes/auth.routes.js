import { Router } from 'express';
import { signUp, signIn, resetPassword } from '../controllers/auth.controller.js';
import authorize, { validateRegister, validateLogin, validateChangePassword } from '../middlewares/auth.middleware.js';

const authRouter = Router();

authRouter.post('/sign-up', validateRegister, signUp);
authRouter.post('/sign-in', validateLogin, signIn);
authRouter.post('/change-password', authorize, validateChangePassword, resetPassword);

export default authRouter;