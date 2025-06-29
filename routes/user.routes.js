import express from 'express'
const UserRouter = express.Router()
import { createUser, fetchUser, login, logout, refreshToken, session, updateImage } from '../controllers/user.controller.js'
import { AdminGuard, AdminUserGuard, RefreshTokenGuard,  } from '../middlewares/user.middlewares.js'

UserRouter.get('/', fetchUser)
UserRouter.get("/session",  AdminUserGuard,  session)
UserRouter.post("/signup", createUser)
UserRouter.post("/login", login)
UserRouter.post("/logout", logout)
UserRouter.put('/update-image', AdminUserGuard, updateImage)
UserRouter.get('/refresh-token', RefreshTokenGuard, refreshToken)


export default UserRouter