import { model, Schema } from 'mongoose'

const storageModel = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  path: {
    type: String,
    required: true,
    trim: true
  },
  chat: [{
    type: Schema.Types.ObjectId,
    ref: "Chat"
  }],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true })

const StorageModel = model('Storage', storageModel)
export default StorageModel
