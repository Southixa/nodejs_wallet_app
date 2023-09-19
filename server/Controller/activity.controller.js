import mongoose from "mongoose";
import UploadImage from "../Config/cloudinary.js";
import Models from "../Model/index.model.js";
import { ActivityTypes, EMessage, SMessage } from "../Service/message.js";
import { SendError400, SendError404, SendError500, SendSuccess } from "../Service/response.js";
import { validateActivityInsert, validateActivityUpdate } from "../Service/validate.js";

export default class ActivityController {

    static async getByUserAndActType(req, res) {
        try {
            const userId = req.params.userId;
            if(!mongoose.Types.ObjectId.isValid(userId)){
                return SendError404(res, EMessage.notFound + " userId");
            } 
            const {actType} = req.body;
            if(!actType){
                return SendError400(res, "actType is required!");
            }
            const checkActType = Object.assign(ActivityTypes)
            if(!Object.values(checkActType).includes(actType)){
                return SendError400(res, "not match activityType");
            }
            const activity = await Models.Activity.find({isActive: true, user_id: userId, actType})
            if(!activity){
                return SendError400(res, EMessage.notFound + " activity");
            }
            return SendSuccess(res, SMessage.getByCategory, activity);
        } catch (error) {
            console.log(error);
            return SendError500(res, "Error", error);
        }
    }

    static async getByUser(req, res) {
        try {
            const userId = req.params.userId;
            if(!mongoose.Types.ObjectId.isValid(userId)){
                return SendError404(res, EMessage.notFound + " userId");
            }
            const activity = await Models.Activity.find({isActive: true, user_id: userId});
            if(!activity){
                return SendError400(res, "not found activity");
            }
            return SendSuccess(res, SMessage.getByUser, activity);
        } catch (error) {
            console.log(error);
            return SendError500(res, "Error", error);
        }
    }

    static async getOne(req, res) {
        try {
            const actId = req.params.actId;
            if(!mongoose.Types.ObjectId.isValid(actId)) {
                return SendError404(res, EMessage.notFound + "actId");
            }
            const activity = await Models.Activity.findOne({isActive: true, _id: actId});
            if(!activity){
                return SendError400(res, "not found activity");
            }
            return SendSuccess(res, SMessage.getOne, activity);
        } catch (error) {
            console.log(error);
            return SendError500(res, "Error", error);
        }
    }

    static async getAll(req, res) {
        try {
            const activity = await Models.Activity.find({isActive: true});
            if(!activity){
                return SendError400(res, "not found activity");
            }
            return SendSuccess(res, SMessage.getAll, activity);
        } catch (error) {
            console.log(error);
            return SendError500(res, "Error", error);
        }
    }

    static async insert(req, res) {
        try {
            const validate = validateActivityInsert(req.body);
            if(validate > 0){
                return SendError400(res, EMessage.pleaseInput + validate.join(","));
            }
            const {userId, actType, amount, detail} = req.body;
            const checkUserId = await Models.User.find({isActive: true, _id: userId});
            if(!checkUserId){
                return SendError400(res, "not found userId");
            }

            const checkWallet = await Models.Wallet.find({isActive: true, user_id: userId});
            if(!checkWallet){
                return SendError400(res, "not found wallet");
            }

            const checkActType = Object.assign(ActivityTypes)
            if(!Object.values(checkActType).includes(actType)){
                return SendError400(res, "not match activityType");
            }

            const image = req.files.image;
            if(!image){
                return SendError400(res, "files is required!");
            }
            const image_url = await UploadImage(image.data);
            if(!image_url){
                return SendError400(res, "Error Upload file");
            }

            const activity = await Models.Activity.create({
                user_id: userId,
                actType,
                amount,
                detail,
                image: image_url
            })
            if(!activity){
                return SendError500(res, "Error Insert activity");
            }

            // update balance in wallet
            let balance = 0;
            const user_id = userId;
            const wallet = await Models.Wallet.findOne({isActive: true, user_id: userId});
            if(actType == "income"){
                balance = parseInt(wallet.balance) + parseInt(amount);
            } else if( actType == "expenses"){
                balance = parseInt(wallet.balance) - parseInt(amount);
            } else {
                balance = parseInt(wallet.balance) - parseInt(amount);
            }

            const walletUpdated = await Models.Wallet.findOneAndUpdate(
                {user_id},
                {
                    balance
                },
                {new: true}
            );

            const result = Object.assign(
                JSON.parse(JSON.stringify(activity)),
                {balance: walletUpdated.balance},
            );

            return SendSuccess(res, SMessage.create, result);
        } catch (error) {
            console.log(error);
            return SendError500(res, "Error", error);
        }
    }

    static async update(req, res) {
        try {
            const actId = req.params.actId;
            if(!mongoose.Types.ObjectId.isValid(actId)){
                return SendError400(res, " actId is required!!");
            }
            const validate = validateActivityUpdate(req.body);
            if(validate > 0){
                return SendError400(res, EMessage.pleaseInput + validate.join(","));
            }
            const {userId, actType, amount, detail} = req.body;
            const checkUserId = await Models.User.find({isActive: true, _id: userId});
            if(!checkUserId){
                return SendError400(res, "not found userId");
            }

            const checkWallet = await Models.Wallet.findOne({isActive: true, user_id: userId});
            if(!checkWallet){
                return SendError400(res, "not found wallet");
            }

            const checkActType = Object.assign(ActivityTypes)
            if(!Object.values(checkActType).includes(actType)){
                return SendError400(res, "not match activityType");
            }

            const image = req.files.image;
            if(!image){
                return SendError400(res, "files is required!");
            }
            const image_url = await UploadImage(image.data);
            if(!image_url){
                return SendError400(res, "Error Upload file");
            }
            const activity = await Models.Activity.findOne({isActive: true, _id: actId});

            const activityUpdated = await Models.Activity.findByIdAndUpdate(
                actId,
                {
                user_id: userId,
                actType,
                amount,
                detail,
                image: image_url
                },
                {new: true}
            )

            
            // update balance in wallets

            let prevAmount = parseInt(activity.amount);
            let prevBalance = parseInt(checkWallet.balance);
            let prevActType = activity.actType;

            let currentAmount = parseInt(amount);
            let currentBalance = 0;
            let currentActtype = actType;


            if((prevActType == "income") && (currentActtype == "income")){
                currentBalance = prevBalance - (prevAmount - currentAmount);
            } else if ((prevActType == "income") && (currentActtype == "expenses")){
                currentBalance = prevBalance - (prevAmount + currentAmount);
            } else if ((prevActType == "income") && (currentActtype == "save")){
                currentBalance = prevBalance - (prevAmount + currentAmount);
            } else if ((prevActType == "expenses") && (currentActtype == "income")){
                currentBalance = prevBalance + (prevAmount + currentAmount);
            } else if ((prevActType == "expenses") && (currentActtype == "expenses")){
                currentBalance = prevBalance + (prevAmount - currentAmount);
            } else if ((prevActType == "expenses") && (currentActtype == "save")){
                currentBalance = prevBalance + (prevAmount - currentAmount);
            } else if ((prevActType == "save") && (currentActtype == "income")){
                currentBalance = prevBalance + (prevAmount + currentAmount);
            } else if ((prevActType == "save") && (currentActtype == "expenses")){
                currentBalance = prevBalance + (prevAmount - currentAmount);
            } else if ((prevActType == "save") && (currentActtype == "save")){
                currentBalance = prevBalance + (prevAmount - currentAmount);
            }

            const user_id = userId;
            const walletUpdated = await Models.Wallet.findOneAndUpdate(
                {user_id},
                {
                    balance: currentBalance
                },
                {new: true}
            );

            const result = Object.assign(
                JSON.parse(JSON.stringify(activityUpdated)),
                {balance: walletUpdated.balance},
            );

            return SendSuccess(res, SMessage.update, result);

        } catch (error) {
            console.log(error);
            return SendError500(res, "Error", error);
        }
    }

    static async delete(req, res){
        try {
            const actId = req.params.actId;
            if(!mongoose.Types.ObjectId.isValid(actId)){
                return SendError400(res, EMessage.notFound + " actId");
            }
            const checkAct = await Models.Activity.findOne({isActive: false, _id: actId});
            if(checkAct){
                return SendError400(res, " already deleted");
            }
            const activity = await Models.Activity.findByIdAndUpdate(
                actId,
                {
                    isActive: false
                }, {new: true}
            )
            
            // update wallet balance
            const user_id = activity.user_id;
            const wallet = await Models.Wallet.findOne({isActive: true, user_id});

            let prevAmount = parseInt(activity.amount);
            let prevBalance = parseInt(wallet.balance);
            let prevActType = activity.actType;

            let currentBalance = 0;

            if(prevActType == "income"){
                currentBalance = prevBalance - prevAmount
            } else if(prevActType == "expenses") {
                currentBalance = prevBalance + prevAmount
            } else {
                currentBalance = prevBalance + prevAmount
            }

            const walletUpdated = await Models.Wallet.findOneAndUpdate(
                {user_id},
                {
                    balance: currentBalance
                },
                {new: true}
            )

            const result = Object.assign(
                JSON.parse(JSON.stringify(activity)),
                {balance: walletUpdated.balance},
            );

            return SendSuccess(res, SMessage.delete, result);


        } catch (error) {
            console.log(error);
            return SendError500(res, "Error", error);
        }
    }

    



}