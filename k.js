const passport = require('passport')
const session = require('express-session')
const LocalStrategy = require('passport-local').Strategy

app.use(
    session({
        secret: "my-secret",
        resave: false,
        saveUninitialized: true,
        cookie: {maxAge: 3600000}
    }

    )
);


app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs');
app.set('views', './protected');
const bcrypt = require('bcrypt');
const saltRounds = 10;

passport.use(new LocalStrategy(
    function (username, password, done){
        const query = 'SELECT tblUserId, txtUserName, txtPassword from tblUser WHERE txtUsername = ?';
        pool.query(query, [username], (error, results) => {
            if(error){
                console.error("error", error);
                return done(null, false);
            }else{
                if(results.length == 1){
                    bcrypt.compare(password, results[0].txtPassword)
                    .then(res => {
                        if(res){
                            console.log("Success");
                            let authenticated_user = {id: results[0].tblUserId, name:  results[0].txtUsername};
                            return done(null, authenticated_user)
                        }else{
                            return done(null, false)
                        }
                    })
                    .catch(err => console.error(err.message))
                } else{
                    return done(null, false);
                }
            }
        })
    }
    

))

passport.serializeUser((user, done) => {
    console.log('Serialize User:', user);
    done(null, user);
})

passport.deserializeUser((user, done) => {
    console.log('deSerialize User:', user);
    done(null, user);
})


checkAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()) {return next();}
    res.redirect("/login")
}

app.get("/dashboard", checkAuthenticated, (req,res) => {
    res.render("dashboard.ejs", {name: req.user.name})
})

checkedLoggedIn = (req, res, next) => {
    console.log(req.isAuthenticated());
    if(req.isAuthenticated()){
        return res.redirect("/dashboard")
    }
    next()
}

app.get("/login", (req, res) => {
    res.render("login.ejs")
})

app.post("/login", passport.authenticate('local', {
    successRedirect: "/dashboard",
    failureRedirect: "/login,"
})
);

app.get("/", (req, res) => {
    res.render("login.ejs")
})