import express from "express";
import UserController from "../Controller/user.controller.js";
import { auth } from "../Middleware/auth.js";
import WalletController from "../Controller/wallet.controller.js";
import ActivityController from "../Controller/activity.controller.js";

const router = express.Router();

//--------- user ---------
router.get("/user/getOne/:userId", auth, UserController.getOne);
router.get("/user/getAll", auth, UserController.getAll); 
router.post("/user/register", UserController.register)
router.post("/user/login", UserController.login)
router.put("/user/forget", UserController.forgetPassword)
router.put("/user/delete/:userId", UserController.deleteUser)

router.put("/user/updateProfile/:userId", auth, UserController.updateProfile)
router.put("/user/changePassword/:userId", auth, UserController.changePassword)
router.put("/user/updateProfileImageToServer/:userId", auth, UserController.updateProfileImageToServer)

//--------- wallet ---------
router.post("/wallet/insert", auth, WalletController.insert)
router.get("/wallet/getAll", auth, WalletController.getAll)
router.get("/wallet/getOne/:walletId", auth, WalletController.getOne)
router.get("/wallet/getByUser/:userId", auth, WalletController.getByUser)
router.put("/wallet/update/:walletId", auth, WalletController.update)
router.put("/wallet/delete/:walletId", auth, WalletController.delete)

//--------- activity ---------
router.post("/activity/insert", auth, ActivityController.insert);
router.get("/activity/getAll", auth, ActivityController.getAll)
router.get("/activity/getOne/:actId", auth, ActivityController.getOne)
router.get("/activity/getByUser/:userId", auth, ActivityController.getByUser)
router.get("/activity/getByUserAndActType/:userId", auth, ActivityController.getByUserAndActType)
router.put("/activity/update/:actId", auth, ActivityController.update)
router.put("/activity/delete/:actId", auth, ActivityController.delete)


export default router;