import crypto from "crypto-js";
import { JWT_OUT_REFRESH_TOKEN, JWT_OUT_TOKEN, SECRET_KEY, USER_TYPE } from "../Config/globalKey.js";
import jwt from "jsonwebtoken";
import Models from "../Model/index.model.js";

export const VerifyToken = async (token) => {
    return new Promise(async (resovle, reject) => {
      try {
        jwt.verify(token, SECRET_KEY, async (err, decode) => {
          if (err) reject(`err${err}`);
  
          //console.log(decode);

          const decriptToken = await DeCrypts(decode.id);
         
          if (!decriptToken) {
            reject("Error Decript");
          }
          let decript = decriptToken.replace(/"/g, "");
          //console.log(decript);
          const user = await Models.User.findById({ _id: decript });
          //console.log(user);
          resovle(user);
        });
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };


  export const VerifyRefreshToken = (refreshToken) => {
    return new Promise(async (resovle, reject) => {
      try {
        jwt.verify(refreshToken, SECRET_KEY, async (err, decode) => {
        if(err) return reject(err)

        const decript = await DeCrypts(decode.id);
        const decript2 = await DeCrypts(decript);
        let decriptReplace = decript2.replace(/"/g, "");
        const user = await Models.User.findById(decriptReplace);
        console.log(user.id);
        resovle(user.id);
        });
      } catch (error) {
        console.log(error);
        reject(false);
      }
    });
  };

  

export const EnCrypt = async (data)=>{
    const encrypt = crypto.AES.encrypt(data, SECRET_KEY).toString();
    //console.log("====>Encrypt", encrypt);
    return  encrypt;
}


export const EnCrypts = async (data) => {
    return new Promise (async(resovle, reject)=>{
        try {
            const encrypt = crypto.AES.encrypt(data, SECRET_KEY).toString();
            resovle(encrypt);
        } catch (error) {
            reject(error);
        }
    })
}

export const DeCrypts = async (data) => {
    return new Promise (async(resovle, reject)=>{
        try {
            const decrypt = crypto.AES.decrypt(data, SECRET_KEY);
            let decriptPass = decrypt.toString(crypto.enc.Utf8);
            resovle(decriptPass);
        } catch (error) {
            reject(error);
        }
    })
}
export const jwts = async (data) => {
    return new Promise(async(resovle, reject)=>{
        try {
            let encryptID = await EnCrypts(JSON.stringify(data._id));
            let encryptType = await EnCrypts(JSON.stringify(USER_TYPE));

            let payload = {
                id: encryptID,
                type: encryptType,
            }
            let encryptRefresh = await EnCrypts((payload.id));
            const payload_refresh = {
                id: encryptRefresh,
                type: encryptType,
            }

            //console.log(payload);
            const jwtOutToken = {
                expiresIn: parseInt(JWT_OUT_TOKEN)
            }
            //console.log(jwtOutToken);
            const jwtOutRefreshToken = {
                expiresIn: parseInt(JWT_OUT_REFRESH_TOKEN)
            }
            //console.log(jwtOutRefreshToken);
            const token = jwt.sign(payload, SECRET_KEY, jwtOutToken);
            const refreshToken = jwt.sign(payload_refresh, SECRET_KEY, jwtOutRefreshToken);
            resovle({token, refreshToken});
        } catch (error) {
            console.log(error);
            reject(error);
        }
    })
}