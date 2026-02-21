import express from 'express';
import { inviteUser, verifyAndSetup ,loginUser ,logoutUser,refreshToken,fetachAllUsers} from '../controllers/authController.js';

const authrouter = express.Router();

authrouter.post('/invite', inviteUser);
authrouter.post('/verify-setup', verifyAndSetup);
authrouter.get('/all-users', fetachAllUsers);
authrouter.post('/login', loginUser);
authrouter.post('/refresh', refreshToken);
authrouter.post('/logout', logoutUser);

export default authrouter;