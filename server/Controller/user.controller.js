import mongoose from "mongoose";
import Models from "../Model/index.model.js";
import { EMessage, SMessage } from "../Service/message.js";
import { SendCreate, SendError400, SendError403, SendError404, SendError500, SendSuccess } from "../Service/response.js";
import { DeCrypts, EnCrypt, EnCrypts, VerifyRefreshToken, jwts } from "../Service/service.js";
import { ValidateLogin, ValidateRegister, validateForgetPassword, validateUpdateProfile } from "../Service/validate.js";
import UploadImage from "../Config/cloudinary.js";

export default class UserController {

    static async getOne(req, res) {
        try {
            const userId = req.params.userId;
            if(!mongoose.Types.ObjectId.isValid(userId)) {
                return SendError404(res, EMessage.notFound + "userID");
            }
            const user = await Models.User.findOne({isActive: true, _id: userId}).select("-password");
            return SendSuccess(res, SMessage.getOne, user);
        } catch (error) {
            console.log(error);
            return SendError500(res, "error", error);
        }
    }

    static async getAll(req, res) {
        try {
            const users = await Models.User.find({isActive: true}).select("-password");
            if(!users){
                return SendError400(res, "not found");
            }
            return SendSuccess(res, SMessage.getAll , users);
        } catch (error) {
            console.log(error);
            return SendError500(res, "error", error);
        }
    }

    static async login(req, res) {
        try {
            const validate = ValidateLogin(req.body);
            if(validate.length > 0){
                return SendError400(res, "please input: " + validate.join(","));
            }
            const {email, password} = req.body;
            const checkEmail = await Models.User.findOne({isActive: true, email});
            if(!checkEmail){
                return SendError400(res, EMessage.notFound + " Email", checkEmail);
            }
            const decryptPassword = await DeCrypts(checkEmail.password);
            if(password === decryptPassword){
                const data = await jwts(checkEmail);

                const newData = Object.assign(
                    JSON.parse(JSON.stringify(checkEmail)),
                    JSON.parse(JSON.stringify(data)),
                );

                return SendSuccess(res, SMessage.login, newData);
            }
            return SendError400(res, "password is not match!");
        } catch (error) {
            console.log(error);
            return SendError500(res, "Error", error);
        }
    }


    static async register(req, res) {
        try {
            const {username, email, password, phone} = req.body;
            const validate = ValidateRegister(req.body);
            if(validate.length > 0){
                return SendError400(res, "Please in put:" + validate.join(","));
            }
            const encrypt = await EnCrypt(password);
            if(!encrypt){
                return SendError400(res, "Error encrypt");
            }

            const checkEmail = await Models.User.findOne({isActive: true, email});
            if(checkEmail){
                return SendError403(res, EMessage.emailAlready, checkEmail);
            }

            const user = await Models.User.create({
                username, email, password: encrypt, phone
            })

            const data = await jwts(user);

            const newData = Object.assign(
                JSON.parse(JSON.stringify(user)),
                JSON.parse(JSON.stringify(data)),
            )


            return SendCreate(res, "Insert Success", newData)

        } catch (error) {
            console.log(error);
            return SendError500(res, "Error", error);
        }
    }


    static async forgetPassword(req, res) {
        try {
            const validate = validateForgetPassword(req.body);
            if(validate.length > 0){
                return SendError400(res, "please input: " + validate.join(","));
            }
            const {email, newPassword} = req.body;
            const checkEmail = await Models.User.findOne({ isActive: true, email})
            if(!checkEmail){
                return SendError404(res, EMessage.notFound + " email");
            }
            const encryptPassword = await EnCrypt(newPassword);
            if(!encryptPassword){
                return SendError400(res, "Error Encrypt newPassword");
            }
            const user = await Models.User.findByIdAndUpdate(checkEmail._id, {
                password: encryptPassword
            }, {new: true})
            return SendSuccess(res, SMessage.update, user);
        } catch (error) {
            console.log(error);
            return SendError500(res, "Error", error);
        }
    }

    static async changePassword (req, res) {
        try {
            const userId = req.params.userId;
            if(!mongoose.Types.ObjectId.isValid(userId)){
                return SendError400(res, EMessage.notFound + " userId");
            }
            const {oldPassword, newPassword} = req.body;
            const checkUser = await Models.User.findOne({isActive: true});
            if(!checkUser) {
                return SendError400(res, EMessage.notFound + " user not found");
            }
            if(oldPassword != checkUser.password) {
                return SendError400(res, EMessage.notMatchPassword);
            }
            const encryptNewPassword = await EnCrypts(newPassword);
            const user = await Models.User.findByIdAndUpdate(userId, {
                password : encryptNewPassword
            }, {new: true})
            return SendSuccess(res, SMessage.update, user);

        } catch (error) {
            console.log(error);
            return SendError500(res, "Error", error);
        }
    }

    static async updateProfile(req, res) {
        try {
            const userId = req.params.userId;
            if(!mongoose.Types.ObjectId.isValid(userId)){
                return SendError400(res, "invalid userid");
            }
            const validate = validateUpdateProfile(req.body);
            if(validate.length > 0) {
                return SendError400(res, EMessage.pleaseInput + validate.join(","));
            }
            const {username ,phone} = req.body;
            const user = await Models.User.findByIdAndUpdate(userId, {
                username, phone
            }, {new: true});
            return SendSuccess(res, SMessage.update, user);
        } catch (error) {
            console.log(error);
            return SendError500(res, "Error", error);
        }
    }

    static async updateProfileImageToServer(req, res) {
        try {
            const userId = req.params.userId;
            if(!mongoose.Types.ObjectId.isValid(userId)){
                return SendError404(res, EMessage.notFound + "UserId");
            }
            const image = req.files.image;
            if(!image){
                return SendError400(res, "files is required!");
            }
            const image_url = await UploadImage(image.data);
            if(!image_url){
                return SendError400(res, "Error Upload file");
            }
            const user = await Models.User.findByIdAndUpdate(
                userId,
                {
                    profile: image_url,
                },
                {new: true}
            )
            return SendSuccess(res, SMessage.update, user);
        } catch (error) {
            console.log(error);
            return SendError500(res, EMessage.serverFaild, error);
        }
    }

    static async deleteUser(req, res) {
        try {
            const userId = req.params.userId;
          if (!mongoose.Types.ObjectId.isValid(userId)) {
            return SendError404(res, EMessage.notFound + " userId");
          }
          const user = await Models.User.findByIdAndUpdate(userId, {
            isActive: false
          }, {new: true});
          if(!user) {
            return SendError404(res, EMessage.notFound + " address");
          }
          SendSuccess(res, SMessage.delete, user);
        } catch (error) {
            console.log(error);
            return SendError500(res, EMessage.serverFaild, error);
        }
      }

    

}