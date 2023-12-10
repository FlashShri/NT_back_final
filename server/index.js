import express from "express";
import mongoose from "mongoose";
import { userfood } from "./Models/UserFoodModel.js";
import cors from "cors";
import { Admin } from "./Models/AdminModel.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import StatusCodes from "http-status-code";
import { User } from "./Models/UserModel.js";
const app = express();
app.use(express.json());

app.use(cors());

// connect to db
const connectDb = () => {
  try {
    mongoose.connect(
      "mongodb+srv://shrikantdhengle7:gBlRlPw02As9mKKa@cntdb.smg7xv5.mongodb.net/?retryWrites=true&w=majority"
    );
    console.log("db connect");
  } catch (error) {
    console.log(error);
  }
};

//~~~~~~~~~~~~~~~~~~ Token Verification ~~~~~~~~~~~~~~~~//

function verifyToken(req, res, next) {
  // get token from client side
  const header = req.get("Authorization");
  if (header) {
    const token = header.split(" ")[1];

    jwt.verify(token, "secret1234", (err, payload) => {
      if (err) {
        res.status(StatusCodes.UNAUTHORIZED).send({ msg: "invalid token" });
      } else {
        next();
      }
    });
  } else {
    res.status(StatusCodes.UNAUTHORIZED).send({ msg: "please login first " });
  }
}


function verifyUserToken(req, res, next) {
  // get token from client side
  const header = req.get("Authorization");
  if (header) {
    const token = header.split(" ")[1];

    jwt.verify(token, "secret1234", (err, payload) => {
      if (err) {
        res.status(401).send({ msg: "invalid token" });
      } else {
        next();
      }
    });
  } else {
    res.status(401).send({ msg: "please login first " });
  }
}

//~~~~~~~~~~~~~~~~~~ Admin API ~~~~~~~~~~~~~~~~//

app.post("/admin", async (req, res) => {
  try {
    const reqData = req.body;
    reqData["password"] = bcrypt.hashSync(reqData.password, 10);
    const admin = new Admin(reqData);
    await admin.save();
    res.send({ admin: admin });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ msg: "admin can't be created error " });
  }
});

app.post("/admin/login", async (req, res) => {
  console.log(req.body.email);
  try {
    const admin = await Admin.findOne({ email: req.body.email });
    console.log(admin);

    if (admin) {
      if (bcrypt.compareSync(req.body.password, admin.password)) {
        const token = jwt.sign(
          {
            adminemail: admin.email,
          },
          "secret1234"
        );

        res
          .status(200)
          .send({ msg: "login success!!", tokenkey: token });
      } else {
        res.status(405).send({ msg: "invalid password" });
      }
    } else {
      res
        .status(405)
        .send({ msg: "invalid email or password" });
    }
  } catch (error) {
    console.log(error);
    res.status(404).send("internal error ");
  }
});
//~~~~~~~~~~~~~~~~~~ User Api ~~~~~~~~~~~~~~~~//

app.post("/user/register", async (req, res) => {
  const { name, email, phone,  password, cpassword } = req.body;
  if (!name || !email || !phone || !password || !cpassword) {
    return res.status(422).json({ error: "please field form" });
  }
  try {
    const userExist = await User.findOne({ email: email });
    if (userExist) {
      return res.status(422).json({ error: "Email already exists" });
    } else if (password != cpassword) {
      return res.status(422).json({ error: "passward are not matching" });
    } else {
      
      const user = new User({ name, email, phone, password, cpassword });
      await user.save();
      res.status(201).json({ message: "User registration successfully" });
    }
  } catch (err) {
    console.log(err);
  }
});

// login here
app.post("/user/signin", async (req, res) => {
  //console.log(req.body);
  //res.json({message:"awesome"});
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Please fill th data" });
    }

    const userLogin = await User.findOne({ email: email }); // email present in db:email return by user
    //console.log(userLogin); //weiten pass

    if (userLogin) {
      const isMatch = await bcrypt.compare(password, userLogin.password);

      if (!isMatch) {
        res.status(400).send({ 
          error: "Invalid Credientials"
         
        });
      } else {

        const usertoken = jwt.sign(
          {
            useremail : User.email,
          },
          "secret1234"
        );
        res.json({ message: "user signin successfully", tokenkey: usertoken });
      }
    } else {
      res.status(400).json({ error: "Invalid Credientials" });
    }
  } catch (err) {
    console.log(err);
  }
});

//~~~~~~~~~~~~~~~~~~ User Food Api ~~~~~~~~~~~~~~~~//
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
  //  const { name, serving , protein , calories, sugar, category } = req.body;
  //  if (!name || !serving || !protein || !calories || !sugar || !category) {
  //    return res.status(422).send({msg : "invalid input"});
  //  }

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
