
import express from 'express'
import {
    register, authentication, confirm,
    forgetPassword, forgetPasswordCheck,
    newPassword, profile
} from '../controllers/userController.js'
import checkAuth from '../middleware/checkAuth.js'

const router = express.Router()

// auth, register, confirmation of users
router.post('/', register) // register a user
router.post('/login', authentication)
router.get('/confirm/:token', confirm)
router.post('/forget-password', forgetPassword)
router.get('/forget-password/:token', forgetPasswordCheck)
router.post('/forget-password/:token', newPassword)
router.get('/profile', checkAuth, profile)

export default router