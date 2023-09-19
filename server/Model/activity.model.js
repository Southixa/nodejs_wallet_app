import mongoose from "mongoose";

const ActivitySchema = mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: "user",
        require: true,
    },
    actType: {
        type: String,
        require: true
    },
    amount: {
        type: Number,
        require: true
    },
    detail: {
        type: String,
        require: true
    },
    image: {
        type: String,
        require: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {timestamps: true})

const Activity = mongoose.model("activity", ActivitySchema);

export default Activity;