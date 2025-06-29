import UserModel from '../models/user.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Exc from '../utils/exc.util.js'

const FOURTEEN_MINUTE = 840000
const SIX_DAYS = 518400000

export const fetchUser = (req, res) => {
	res.send("Hello")
}

//get token
const getToken = (user) => {
	const payload = {
		id: user._id,
		fullname: user.fullname,
		email: user.email,
		mobile: user.mobile,
		credit: user.credits,
		usedCredits: user.usedCredits,
		subscription: user.subscription,
		role: user.role,
		image: user.image
	}

	const accessToken = jwt.sign(payload, process.env.AUTH_SECRET, { expiresIn: '15m' })
	const refreshToken = jwt.sign(payload, process.env.RT_SECRET, { expiresIn: '7d' })

	return {
		accessToken,
		refreshToken
	}

}


//create user
export const createUser = Exc(async (req, res) => {
	const user = new UserModel(req.body)
	await user.save()
	res.json({ message: "signup success" })
})

//login
export const login = Exc(async (req, res) => {
	const { email, password } = req.body

	const user = await UserModel.findOne({ email })

	if (!user)
		return res.status(404).json({ message: 'User doesn`t exits' })

	const isLoged = await bcrypt.compare(password, user.password)

	if (!isLoged)
		return res.status(401).json({ message: 'Incorrect password' })

	const { accessToken, refreshToken } = getToken(user)
	res.cookie('accessToken', accessToken, {
		maxAge: FOURTEEN_MINUTE,
		domain: process.env.NODE_ENV === "dev" ? "localhost" : process.env.DOMAIN,
		secure: process.env.NODE_ENV === "dev" ? false : true,
		httpOnly: true

	})
	res.cookie('refreshToken', refreshToken, {
		maxAge: SIX_DAYS,
		domain: process.env.NODE_ENV === "dev" ? "localhost" : process.env.DOMAIN,
		secure: process.env.NODE_ENV === "dev" ? false : true,
		httpOnly: true

	})
	res.json({ message: 'Login success !' , role: user.role})
})

export const session = Exc(async (req, res) => {
  res.json(req.user) 
})



//logout
export const logout = Exc(async (req, res) => {
	res.cookie('accessToken', null, {
		maxAge: 0,
		domain: process.env.NODE_ENV === "dev" ? "localhost" : process.env.DOMAIN,
		secure: process.env.NODE_ENV === "dev" ? false : true,
		httpOnly: true

	})

	res.cookie('refreshToken', null, {
		maxAge: 0,
		domain: process.env.NODE_ENV === "dev" ? "localhost" : process.env.DOMAIN,
		secure: process.env.NODE_ENV === "dev" ? false : true,
		httpOnly: true

	})
	res.json({ message: 'Logout success !' })
})


export const updateImage = Exc(async (req, res)=>{
   await UserModel.findByIdAndUpdate(req.user.id, {image: req.body.image})
   res.json({message: 'Image Updated'})
})


//refresh token
export const refreshToken = Exc( async (req, res)=>{
   const user = await  UserModel.findById(req.user.id)

	if (!user)
	{
		res.cookie('accessToken', null, {
			maxAge: 0,
			domain: process.env.NODE_ENV === "dev" ? "localhost" : process.env.DOMAIN,
			secure: process.env.NODE_ENV === "dev" ? false : true,
			httpOnly: true
	
		})

		res.cookie('refreshToken', null, {
			maxAge: 0,
			domain: process.env.NODE_ENV === "dev" ? "localhost" : process.env.DOMAIN,
			secure: process.env.NODE_ENV === "dev" ? false : true,
			httpOnly: true
	
		})
		return res.status(401).json({message: 'Logout success !'})
	}



   const { accessToken, refreshToken } = getToken(user)
  
   res.cookie('accessToken', accessToken, {
	   maxAge: FOURTEEN_MINUTE,
	   domain: process.env.NODE_ENV === "dev" ? "localhost" : process.env.DOMAIN,
	   secure: process.env.NODE_ENV === "dev" ? false : true,
	   httpOnly: true

   })
   res.cookie('refreshToken', refreshToken, {
	   maxAge: SIX_DAYS,
	   domain: process.env.NODE_ENV === "dev" ? "localhost" : process.env.DOMAIN,
	   secure: process.env.NODE_ENV === "dev" ? false : true,
	   httpOnly: true

   })
   res.json({ message: 'Token refresh success!' , role: user.role})
   
})

