// routes/auth.routes.js

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();
const userSchema = require("../models/User");
const testSchema = require ("../models/Test")
const authorize = require("../middleware/auth");
const { check, validationResult } = require('express-validator');

// create user
router.post("/register-user",
    [
        check('name')
            .not()
            .isEmpty()
            .isLength({ min: 3 })
            .withMessage('Name must be atleast 3 characters long'),
        check('email', 'Email is required')
            .not()
            .isEmpty(),
        check('password', 'Password should be between 4 to 10 characters long')
            .not()
            .isEmpty()
            .isLength({ min: 4, max: 10 })
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        console.log(req.body);

        if (!errors.isEmpty()) {
            return res.status(422).jsonp(errors.array());
        }
        else {
            bcrypt.hash(req.body.password, 10).then((hash) => {
                const user = new userSchema({
                    name: req.body.name,
                    email: req.body.email,
                    password: hash
                });
                user.save().then((response) => {
                    res.status(201).json({
                        message: "User successfully created!",
                        result: response
                    });
                }).catch(error => {
                    res.status(500).json({
                        error: error
                    });
                });
            });
        }
    });

//create tests

router.post("/create-test",[
    check('jeu')
        .not()
        .isEmpty(),
    check('test')
        .not()
        .isEmpty(),
    check('note')
        .not()
        .notEmpty(),
    check('pseudo')
        .not()
        .notEmpty()
],(req, res, next) => {
    const errors = validationResult(req);
        console.log(req.body);

        if (!errors.isEmpty()) {
            return res.status(422).jsonp(errors.array());
        }
        else{
            const test = new testSchema({
                jeu: req.body.jeu,
                test: req.body.test,
                note: req.body.note,
                pseudo: req.body.pseudo
            });
            test.save().then((response) =>{
                res.status(201).json({
                    message: "Test succesfully created",
                    result: response
                });
            }).catch(error => {
                res.status(500).json({
                    error: error
                });
            });
        }
}
)

// Sign-in
router.post("/signin", (req, res, next) => {
    let getUser;
    userSchema.findOne({
        email: req.body.email
    }).then(user => {
        if (!user) {
            return res.status(401).json({
                message: "Authentication failed"
            });
        }
        getUser = user;
        return bcrypt.compare(req.body.password, user.password);
    }).then(response => {
        if (!response) {
            return res.status(401).json({
                message: "Authentication failed"
            });
        }
        let jwtToken = jwt.sign({
            email: getUser.email,
            userId: getUser._id
        }, "longer-secret-is-better", {
            expiresIn: "1h"
        });
        res.status(200).json({
            token: jwtToken,
            expiresIn: 3600,
            _id: getUser._id
        });
    }).catch(err => {
        return res.status(401).json({
            message: "Authentication failed"
        });
    });
});

// Get Users
router.route('/').get((req, res) => {
    userSchema.find((error, response) => {
        if (error) {
            return next(error)
        } else {
            res.status(200).json(response)
        }
    })
})

//get tests

router.route('/tests').get((req, res) => {
    testSchema.find((error, response) => {
        if (error){
            return next (error)
        } else {
            res.status(200).json(response)
        }
    })
})

// Get Single User
router.route('/user-profile/:id').get(authorize, (req, res, next) => {
    userSchema.findById(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                msg: data
            })
        }
    })
})

// Update User
// router.route('/update-user/:id').put((req, res, next) => {
//     userSchema.findById(req.params.id, {
//         $set: req.body
//     }, (error, data) => {
//         if (error) {
//             return next(error);
//             console.log(error)
//         } else {
//             res.json(data)
//             console.log('User successfully updated!')
//         }
//     })
// })

//update test
// router.route('/update-test/:id').put((req, res, next) => {
//     testSchema.findById({_id:req.params.id},{
//         $set: req.body
//     },(error, data) =>{
//         if (error){
//             return next(error);
//             console.log(error)
//         } else {
//             res.json(data)
//             console.log('Test successfully updated')
//         }
//     })
// })

//upadte user
router.route('/update-user/:id').put((req, res)=>{
    userSchema.findById({_id:req.params.id},(err,data) =>{
        if (err) {
            console.log(err)
            return next(err); 
                     } else{
                         data.name= req.body.name;
                         data.email = req.body.email;
                         data.password = req.body.password;
                         data.save((err) =>{
                             if(err){
                                 console.log(err)
                             } else {
                                console.log('good job user modifie with success')
                                console.log(data)
                                res.send('utilisateur modifié avec succés')        
                             }
                         })
                     }
    })
})

// Delete User
router.route('/delete-user/:id').delete((req, res, next) => {
    userSchema.deleteOne({ _id: req.params.id}, (error, data) => {
        if (error) {
            return next(error);
        } else {
            console.log("user supprimé avec succès!")
            res.status(200).json({
                msg: data
                
            })
        }
    })
})

// Delete test
router.route('/delete-test/:id').delete((req, res, next) =>{
    testSchema.deleteOne({_id: req.params.id}, (error, data) =>{
        if (error) {
            return next(error);
        } else {
            console.log("test supprimé avec succès!")
            res.status(200).json({
                msg: data
                
            })
    }
})
})

//api rawger
async function getGame() {
    const Rawger = require('rawger');
    const { games } = await Rawger({});


    const game = (await games.get('the-binding-of-isaac-afterbirth')); // return game object
    let data = {
        img: game.raw().background_image,
        name: game.raw().name,
        desc: game.raw().description
    }


    return data;

}

async function getGames() {
    const Rawger = require('rawger');
    const { games } = await Rawger({});


    const game = (await games.get('metal-gear-solid-4-guns-of-the-patriots')); // return game object
    let data = {
        img: game.raw().background_image,
        name: game.raw().name,
        desc: game.raw().description
    }


    return data;

}

router.route('/getData').get((req, res) => {

        getGame().then((datd) => {
            res.send(datd)
        });
    });
    

router.route('/getDatas').get((req, res) => {
        getGames().then((datas) => {
            res.send(datas)
        });
    }); 
       

module.exports = router;