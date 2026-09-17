import { findSimilarUsernames, getAllUsers, loginUser, registerUser } from "../controllers/userController";
import { auth } from "../middleware/auth";

const express = require('express');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/users', auth, getAllUsers);
router.get('/similar-usernames', auth, findSimilarUsernames);

const userRoutes = router;
export default userRoutes;
