import express from 'express';
import { inviteUser, verifyAndSetup ,loginUser ,logoutUser,refreshToken,fetchname} from '../controllers/authController.js';

const authrouter = express.Router();

authrouter.post('/invite', inviteUser);
authrouter.post('/verify-setup', verifyAndSetup);
authrouter.post('/login', loginUser);
authrouter.post('/refresh', refreshToken);
authrouter.post('/logout', logoutUser);
authrouter.get('/dirushan',fetchname);
export default authrouter;