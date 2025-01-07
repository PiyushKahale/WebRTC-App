import { User } from "../models/user.model.js"
import httpStatus from "http-status"
import bcrypt, {hash} from "bcrypt"
import crypto from "crypto"


const login = async (req, res) => {
    const {username, password} = req.body;
    // return res.status(httpStatus.OK).json({ message: "All Okay!"})

    if(!username || !password) {
        return res.status(httpStatus.NOT_FOUND).json({message: "Please Enter the correct details."})
    }

    try {
        const user = await User.findOne({username})
        // Check user not exist
        if(!user) {
            return res.status(httpStatus.NOT_FOUND).json({message: "User Not Found"})
        }
        // return res.json(user)

        let isPassCorrect = await bcrypt.compare(password, user.password)
        
        // 
        if(isPassCorrect) {
            // store tokens in localStorage of ""20"" size
            let token = crypto.randomBytes(20).toString("hex");
            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({ token: token})
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({message: "Invalid Username or password."})
        }

    } catch (e) {
        return res.status(500).json({message: `Something went wrong ${e}`})
    }
}


const register = async (req, res) => {
    // Take out all things from Body
    const {name, username, password} = req.body;


    try {
        const existingUser = await User.findOne({username});
        // check for user Exist
        if(existingUser) {
            return res.status(httpStatus.FOUND).json({message: "User already Exist"})
        }

        // hash password using bcrypt (pass, salt)
        const hashedPassword = await bcrypt.hash(password, 10)
        
        // getting new info and putting into model
        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword
        })

        // saving it to mongoDB
        await newUser.save()
        res.status(httpStatus.CREATED).json({message: "New User Registered"})

    } catch(e) {
        res.json({message: `Something went wrong ${e}`})
    }
}





export {login, register}
