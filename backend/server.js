import express from 'express';
import cors from 'cors';
import mysql from 'mysql';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const app = express();

dotenv.config();

app.use(cors());
app.use(express.json())
const portNum = 8180

const db = mysql.createConnection( {
    host: "localhost",
    user: "root",
    password: process.env.Mysql_Password,
    database: "signup"
});

  
app.post('/signup', async (req, res) => {
        const checkEmailQuery = "select count(`email`) as `count` from login where `email`= ? group by `email`";
        const email = [req.body.email];

        var password = req.body.password;

        db.query(checkEmailQuery, email, (err, data) => {
            if(err) {
                return res.status(500).json(err);
            }

            //If we get null data that means email is not available so insert the new record
            if(typeof data != "undefined" && data[0] != null && data[0].count > 0) {
                return res.status(400).json({id: 1, message : "Email is already available. Please login or use different"});
            }
        })

        //  generate salt to hash password
         const salt = await bcrypt.genSalt(5);

        // now we set the user password to hashed password
         const hash = await bcrypt.hash(password.toString(), salt);
         console.log(hash);

        const insertData = "insert into login(`name`, `email`, `password`) values (?)";
        const values = [
            req.body.name,
            req.body.email,
            hash,
        ]

        db.query(insertData, [values], (err, data) => {
            if(err) {
                console.log(err)
                return res.status(500).json(err);
            }
            return res.json(data);
        })

})

app.post('/login', async (req, res) => {
        console.log("Data is : " + req.body.email + " " + req.body.password);

        const sql =  "select * from login where `email`= ?";

        db.query(sql, [req.body.email], async (err, data) => {
            if(err) {
                return res.status(500).json({error : 1, message : err});
            }

            if(data.length > 0) {

                // now we set the user password to hashed password
                const comparePassword = await bcrypt.compare(req.body.password.toString(), data[0].password);
                if(!comparePassword) return res.json({error : 1, message : "UserName or password is wrong"});

                const token = jwt.sign({ email : data[0].email}, process.env.JWT, {expiresIn: '1h'});

                res.cookie('token_info', token, { httpOnly: true });

                return res.json({error : 0, name : data[0].name, email: data[0].email})
            }
            else {
                return res.json({error : 1, message : "UserName or password is wrong"})
            }
        })
})

// Middleware
app.use(cookieParser())


app.listen(portNum,() => {
    console.log("Connected to backend")
})