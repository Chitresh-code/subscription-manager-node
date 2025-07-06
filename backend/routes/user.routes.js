import { Router } from 'express';
import { getUsers, getUserbyId, updateUserDetails, deleteUserAccount } from '../controllers/user.controller.js';
import authorize from '../middlewares/auth.middleware.js';
import { 
    validateUpdateProfile, validateUserId, 
} from '../middlewares/user.middleware.js';

const userRouter = Router();

userRouter.get('/', authorize, getUsers);
userRouter.get('/:id', authorize, validateUserId, getUserbyId);
userRouter.put('/:id', authorize, validateUserId, validateUpdateProfile, updateUserDetails);
userRouter.delete('/:id', authorize, validateUserId, deleteUserAccount);

export default userRouter;