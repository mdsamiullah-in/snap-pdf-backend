// models/chatModel.js
import {model, Schema} from "mongoose";

const chatModel = new Schema({
  question: { 
    type: String, 
    required: true 
},
  answer: { 
    type: String, 
    required: true 
},
  fileId: { 
    type: Schema.Types.ObjectId, 
    ref: "Storage", 
    required: true 
},
  fileTitle: { 
    type: String 
},
  user: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
},

});


const ChatModel = model("Chat", chatModel)
export default ChatModel