import Models from "../Model/index.model.js";
import { EMessage, SMessage } from "../Service/message.js";
import { SendError400, SendError403, SendError500, SendSuccess } from "../Service/response.js";
import { validateUpdateWallet, validateWallet } from "../Service/validate.js";

export default class WalletController {
    static async update(req, res) {
        try {
            const walletId = req.params.walletId;
            if(!walletId) {
                return SendError400(res, "walletId is required");
            }
            const validate = validateUpdateWallet(req.body);
            if(validate.length > 0) {
                return SendError400(res, EMessage.pleaseInput + validate.join(","));
            }
            const {userId, balance} = req.body;
            const checkUserId = await Models.User.find({isActive: true, _id: userId})
            if(!checkUserId){
                return SendError400(res, "invalid userId");
            }
            const wallet = await Models.Wallet.findByIdAndUpdate(
                walletId, {
                    user_id: userId,
                    balance
                },
                {new: true}
            )
            return SendSuccess(res, SMessage.update, wallet);
        } catch (error) {
            console.log(error);
            return SendError500(res, "Error", error);
        }
    }



    static async getOne(req, res) {
        try {
            const walletId = req.params.walletId;
            if(!walletId){
                return SendError400(res, "walletId is required");
            }
            const wallet = await Models.Wallet.findOne({
                isActive: true,
                _id: walletId
            }).populate({
                path: "user_id",
                select: "username email phone"
              });
            if(!wallet) {
                return SendError400(res, EMessage.notFound + "wallet");
            }
            return SendSuccess(res, SMessage.getOne, wallet);
        } catch (error) {
            console.log(error);
            return SendError500(res, "Error", error);
        }
    }

    static async getAll(req, res) {
        try {
            const wallet = await Models.Wallet.find({
                isActive: true
            }).populate({
                path: "user_id",
                select: "username email phone"
              });
            if(!wallet) {
                return SendError400(res, EMessage.notFound + "wallet");
            }
            return SendSuccess(res, SMessage.getAll, wallet);
        } catch (error) {
            console.log(error);
            return SendError500(res, "Error", error);
        }
    }


    static async insert(req, res) {
        try {
            const validate = validateWallet(req.body);
            if(validate > 0) {
                return SendError400(res, EMessage.pleaseInput + validate.join(","));
            }
            const {userId, balance} = req.body;
            const checkUserId = await Models.Wallet.find({isActive: true, user_id: userId});
            const isUserIdExists = Object.keys(checkUserId).length > 0;
            if(isUserIdExists){
                return SendError403(res, "userId aleady exists")
            }
            const wallet = await Models.Wallet.create({
                user_id: userId, 
                balance
            })
            return SendSuccess(res, SMessage.insert, wallet);

        } catch (error) {
            console.log(error);
            return SendError500(res, "Error", error);
        }
    }

    static async delete(req, res) {
        try {
            const walletId = req.params.walletId;
            if(!walletId){
                return SendError400(res, "walletId is required ");
            }
            const wallet = await Models.Wallet.findByIdAndUpdate(
                walletId,
                {
                    isActive: false
                },
                {new: true}
            )
            return SendSuccess(res, SMessage.delete, wallet);
        } catch (error) {
            console.log(error);
            return SendError500(res, "Error", error);
        }
    }

}