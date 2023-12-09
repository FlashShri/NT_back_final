import express from "express";
import mongoose from "mongoose";
import { userfood } from "./Models/UserFoodModel.js";
import cors from "cors";

const app = express();
app.use(express.json());

app.use(cors());

// connect to db
const connectDb = () => {
  try {
    mongoose.connect("mongodb://127.0.0.1:27017/NutriTrack");
    console.log("db connect");
  } catch (error) {
    console.log(error);
  }
};

app.get("/user/food_data", async (req, res) => {
  try {
    const foods = await userfood.find();
    res.send({ foods: foods });
    res.send("you get the data");
  } catch (error) {
    console.log(error);
  }
});

app.post("/user/food_data", async (req, res) => {

   const { name, serving , protein , calories, sugar, category } = req.body;
   if (!name || !serving || !protein || !calories || !sugar || !category) {
     return res.status(422).send({msg : "invalid input"});
   }

  try {
    const reqData = req.body;
    console.log(reqData);
    const u_food = new userfood(reqData);
    await u_food.save();
    res.send({ msg: u_food });
  } catch (error) {
    console.log(error);
    res.send({ msg: "food can't be created error " });
  }
});

app.delete("/user/food_data/:name", async (req, res) => {
  try {
    await userfood.deleteOne({ name: req.params.name });
    res.send({ msg: "delete success" });
  } catch (error) {
    console.log(error);
    res.send({ msg: "error occured in delete" });
  }
});

app.listen(4500, () => {
  console.log("server has started on 4500");
  connectDb();
});
