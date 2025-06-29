import { model, Schema } from 'mongoose'
import bcrypt from 'bcrypt'

const schema = new Schema({
    fullname: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    mobile: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        default: 'user',
    },
    image: {
        type: String,
        default: ''
    },
    credits: {
        type: Number,
        default: 5
    },
    usedCredits: {
        type: Number,
        default: ""
    },
    subscription: [{
        type: Schema.Types.ObjectId,
        ref: "Plan"
    }],
}, { timestamps: true })

// Hash password before saving
schema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    const encrypted = await bcrypt.hash(this.password.toString(), 12)
    this.password = encrypted
    next()
})

const UserModel = model('User', schema)
export default UserModel
