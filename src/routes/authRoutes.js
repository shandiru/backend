import express from 'express';
import { inviteUser, verifyAndSetup ,loginUser ,logoutUser,refreshToken,fetachAllUsers,dirushan,resetPassword,resetPasswordConfirm} from '../controllers/authController.js';
import verifyToken from '../middleware/auth.js';
const authrouter = express.Router();

authrouter.post('/invite', inviteUser);
authrouter.post('/verify-setup', verifyAndSetup);
authrouter.post('/reset-password', resetPassword);
authrouter.post('/reset-password-confirm', resetPasswordConfirm);
authrouter.get('/all-users', fetachAllUsers);
authrouter.post('/login', loginUser);
authrouter.post('/refresh', refreshToken);
authrouter.post('/logout', logoutUser);
authrouter.get('/protected',verifyToken,dirushan);

export default authrouter;