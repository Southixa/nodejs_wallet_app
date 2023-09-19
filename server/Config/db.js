import mongoose from "mongoose";
import { URL_DATABASE } from "./globalKey.js";



const DB = mongoose.connect(URL_DATABASE).then(()=>{
    console.log("Connected Database");
}).catch(()=>{
    console.log("faild to Connect Database");
})


// const Schema = mongoose.Schema;
// //const ObjectId = Schema.ObjectId;

// const User = new Schema({
//     firstname: String,
//     lastname: String,
//     age: Number
// })

// const myModel = mongoose.model('User', User);

// const myModel2 = myModel.create({
//     firstname: "pele",
//     lastname: "philavong",
//     age: 24
// })

// console.log(myModel2);




export default DB;