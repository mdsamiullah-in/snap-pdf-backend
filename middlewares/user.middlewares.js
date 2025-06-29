import Exc from "../utils/exc.util.js"
import jwt from "jsonwebtoken"
import crypto from "crypto"

// Session Expiry Helper
const expireSession = (res) => {
	res.cookie("accessToken", null, {
		maxAge: 0,
		domain: process.env.NODE_ENV === "dev" ? "localhost" : process.env.DOMAIN,
		secure: process.env.NODE_ENV !== "dev",
		httpOnly: true,
	})
	res.cookie("refreshToken", null, {
		maxAge: 0,
		domain: process.env.NODE_ENV === "dev" ? "localhost" : process.env.DOMAIN,
		secure: process.env.NODE_ENV !== "dev",
		httpOnly: true,
	})
	return res.status(401).json({ message: "Unauthorized: Session expired or invalid" })
}

// Admin Only Guard
export const AdminGuard = Exc(async (req, res, next) => {
	const { accessToken } = req.cookies
	if (!accessToken) return expireSession(res)

	const payload = jwt.verify(accessToken, process.env.AUTH_SECRET)
	if (payload.role !== "admin") return expireSession(res)

	req.user = payload
	next()
})

// User Only Guard
export const UserGuard = Exc(async (req, res, next) => {
	const { accessToken } = req.cookies
	if (!accessToken) return expireSession(res)

	const payload = jwt.verify(accessToken, process.env.AUTH_SECRET)
	if (payload.role !== "user") return expireSession(res)

	req.user = payload
	next()
})

// Admin OR User Guard
export const AdminUserGuard = Exc(async (req, res, next) => {
	const { accessToken } = req.cookies
	if (!accessToken) return expireSession(res)

	const payload = jwt.verify(accessToken, process.env.AUTH_SECRET)
	if (!["admin", "user"].includes(payload.role)) return expireSession(res)

	req.user = payload
	next()
})

// Refresh Token Guard
export const RefreshTokenGuard = Exc(async (req, res, next) => {
	const { refreshToken } = req.cookies
	if (!refreshToken) return expireSession(res)

	const payload = jwt.verify(refreshToken, process.env.RT_SECRET)
	if (!["admin", "user"].includes(payload.role)) return expireSession(res)

	req.user = payload
	next()
})




