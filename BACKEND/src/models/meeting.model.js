import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema(
    {
        user_id: {type: String, required: true},
        meetingCode: {type: String, required: true},
        date: {type: String, required: true, default: Date.now},
    }
)


const Meet = mongoose.model("Meet", meetingSchema)

// -- { A, B, C } to export many things from one file 
export { Meet }