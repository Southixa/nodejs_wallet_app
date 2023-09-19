import cloudinary from "cloudinary";
import fs from "fs";
import { CLOUDINARU_API_SECRET, CLOUDINARY_API_KEY, CLOUDINARY_CLOUD_NAME } from "./globalKey.js";

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARU_API_SECRET
});

const UploadImage = async (files, oldImage) => {
    try {
      if(oldImage != undefined) {
        const spliturl = oldImage.split("/");
        const img_id = spliturl[spliturl.length - 1].split(".")[0];
        await cloudinary.uploader.destroy(img_id);
      }
        const base64 = files.toString('base64');
        const imgPath = `data:image/jpeg;base64,${base64}`
        const cloudinaryUpload = await cloudinary.uploader.upload(imgPath, {
          public_id: `IMG_${Date.now()}`,
          resource_type: "auto",
        });
      
      // if (!cloudinaryUpload) {
      //   fs.unlinkSync(files);
      //   return reject(false);
      // }
      // fs.unlinkSync(files);
      return cloudinaryUpload.url;
    } catch (error) {
      console.log(error);
      return "";
    }
  };

export default UploadImage;