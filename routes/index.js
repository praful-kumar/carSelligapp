const express = require('express');
const router = express.Router();
const userModal = require('./users');
const carModal = require('./carSchema');
const passport = require('passport');
const localStratagy = require('passport-local')
const multer = require('multer')

passport.use(new localStratagy(userModal.authenticate()));

/*_______Multer________*/
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images/uploads')
    },
    filename: (req, file, cb) => {
        var filename = Date.now() + file.originalname;
        cb(null, filename)
    }
})

var upload = multer({ storage: storage, fileFilter: fileFilter })
function fileFilter(req, file, cb) {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') cb(null, true)
    else cb(null, false)

}



/*___________________________________________*/


/*_________IndexPage_Route__________ */

router.get('/', redirectToProfile, (req, res) => {
    res.render('index')
});


/*________UserRegistration_________*/

router.post('/reg', (req, res) => {
    const newUser = new userModal({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email
    })
    userModal.register(newUser, req.body.password)
        .then((u) => {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/profile')
            })

        })
})

router.get('/profile', isLogggedin, (req, res) => {
    userModal.findOne({ username: req.session.passport.user })
        .populate('Cars')
        .exec((err, foundUser) => {
            res.render('profile', foundUser)
        })

})




/*_________profile_Pic_Upload___________*/



router.post('/profileUpload', upload.single('images'), function (req, res) {
    userModal.findOne({ username: req.session.passport.user })
        .then((foundUser) => {
            foundUser.profileImg = `../images/uploads/${req.file.filename}`
            foundUser.save()
                .then((u) => {
                    res.redirect('/profile')
                })
        })
})

/**-----------------car detail Uploads ----------- */

router.post('/addcar', upload.single('carImg'), (req, res) => {
    userModal.findOne({ username: req.session.passport.user })
        .then((foundUser) => {
            var imgadd = `../images/uploads/${req.file.filename}`
            carModal.create({
                sellerid: foundUser._id,
                carname: req.body.carname,
                carprice: req.body.carprice,
                contact: req.body.contact,
                carimg: imgadd
            })
                .then((createdCar) => {
                    foundUser.Cars.push(createdCar);
                    foundUser.save()
                        .then((u) => {
                            res.redirect('/profile')
                        })
                })
        })
})

/**__________________sellCarRoutes________________ */

router.get('/sell/:page',isLogggedin,(req, res)=>{
    var perPage = 2;
    var page = Math.max(0, req.params.page);
    carModal.find()
    .limit(perPage)
    .skip(perPage*page)
    .exec((err, cars)=>{
        carModal.count().exec((err,count)=>{
            console.log(cars)
            res.render('sellingapp', {
                cars: cars,
                page: page,
                pages: count / perPage,
                isLogggedin:true
            })
        })
    })
})







/*________loginRoute___________*/
router.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/'
}), (req, res) => { });

/*____________logoutRoute__________*/
router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
})



/*________middleWares For protecting Routes________*/

function isLogggedin(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        res.redirect('/')
    }
};

function redirectToProfile(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/profile')
    }
    else {
        return next();
    }
};



module.exports = router;
