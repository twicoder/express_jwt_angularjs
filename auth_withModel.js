var expressJwt = require("express-jwt");
var jwt = require("jsonwebtoken");
var bcrypt = require('bcrypt');
// var shortid = require("shortid");


module.exports = function(expressapp,config,UseModel){

    var secretcode = config.secret || "secret";
    var getTokenPath = config.loginpath || "/login";
    var nonVerifyPaths = config.nonverifypaths || ["/login"];
    var auth_db_config = config.auth_db_column || { "username":"username","password":"password"};
    var usernameDBColumn = auth_db_config.username;
    var passwordDBColumn = auth_db_config.password;


    expressapp.use(expressJwt({secret: secretcode}).unless({path: nonVerifyPaths}));

    expressapp.post(getTokenPath, function(req, res) {
        var username = req.body.username;
        var password = req.body.password;

        if (!username) {
            return res.status(400).send({"success":false,"message":"username required"});
        }
        if (!password) {
            return res.status(400).send({"success":false,"message":"password required"});
        }

        console.log('before search::::');
        var searchCondition = new Map();
        searchCondition.set(usernameDBColumn,username);
        console.log(searchCondition);


        UseModel.findOne({ where: searchCondition }).then(function(userdata){
            console.log('userdata:');
            console.log(userdata);
            if(!userdata){
                return res.status(401).send({"success":false,"message":"Username does not exist"});
            } else {
                console.log(userdata.dataValues[passwordDBColumn]);
                const pwdMatchFlag =bcrypt.compareSync(password, userdata.dataValues[passwordDBColumn]);
                if(pwdMatchFlag){
                    var authToken = jwt.sign({username: username}, "secret");
                    res.status(200).json({token: authToken});
                } else {
                    return res.status(401).send({"success":false,"message":"Password is incorrect"});
                }
            }

        }).catch(function(err){
            return res.status(500).send({"success":false,"message":"password required"});
        });

    });

    expressapp.use(function (err, req, res, next) {
        if (err.name === "UnauthorizedError") {
            res.status(401).send({"success":false,"msg":"invalid token"});
        }
    });

};