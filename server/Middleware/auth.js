import { EMessage } from "../Service/message.js";
import { SendError401 } from "../Service/response.js";
import { VerifyToken } from "../Service/service.js";

export const auth = async (req, res, next) => {
    try {
        const authorization = req.headers["authorization"];
        if (!authorization) {
            return SendError401(res, EMessage.invalidToken);
        }
        const token = authorization.replace("Bearer ", "");
        if (!token) {
            return SendError401(res, EMessage.invalidToken);
        }

        const decode = await VerifyToken(token);
        req.user = decode._id;
        next();
    } catch (error) {
        console.log(error);
        return SendError500(res, EMessage.serverFaild, error);
    }
}