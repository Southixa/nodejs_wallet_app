import mongoose from "mongoose";

const walletSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: "user",
        require: true,
    },
    balance: {
        type: Number,
        require: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, {timestamps: true});

const Wallet = mongoose.model("wallet", walletSchema);

export default Wallet;