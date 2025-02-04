import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema(
    {
        user_id: {type: String, required: true},
        meetingCode: {type: String, required: true},
        date: {type: String, default: Date.now, required: true}
    }
)


const Meeting = mongoose.model("Meeting", meetingSchema)

// -- { A, B, C } to export many things from one file 
export { Meeting }