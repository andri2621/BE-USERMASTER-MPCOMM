import {Router} from 'express';
// import usersCtrl from '../controllers/IndexController'
import indexCtrl from '../controllers/IndexController'
const { runValidation, validationDaftar, validationLogin } = require('../controllers/validation')
const verifyToken = require('./verifyToken')

const router = Router();

// router.get('/',verifyToken, usersCtrl.readUsersMethod);
// router.get('/:usersId',usersCtrl.findUsersMethod);
// router.post('/',validationDaftar,runValidation,usersCtrl.addUsersMethod);
// router.put('/:usersId',usersCtrl.editUsersMethod);
// router.delete('/:usersId',usersCtrl.deleteUsersMethod);

// router.post('/login',usersCtrl.loginUsersMethod);


router.put('/:usersId', indexCtrl.users.editusersMethod);
router.delete('/:usersId',indexCtrl.users.deleteusersMethod);

router.get('/',indexCtrl.users.requireSignin,indexCtrl.users.findUsersMethod);
router.post('/signup',validationDaftar,runValidation, indexCtrl.users.signup);
router.post('/signin/', validationLogin,runValidation,indexCtrl.users.signin);
router.post('/signout/', indexCtrl.users.signout);


router.get('/all/', indexCtrl.users.readAllUser);
router.get('/cari/:userId', indexCtrl.users.findUser);


router.post('/ubahpassword/',indexCtrl.users.ubahPassword);



router.post("/signup-with-recaptcha", async (req, res, next) => {
    if (!req.body.token) {
        return res.status(400).json({ error: "reCaptcha token is missing" });
    }

    try {
        const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.reCaptchaSecret}&response=${req.body.token}`;
        const response = await axios.post(googleVerifyUrl);
        const { success } = response.data;
        if (success) {
            //Do sign up and store user in database
            return res.json({ success: true });
        } else {
            return res
                .status(400)
                .json({ error: "Invalid Captcha. Try again." });
        }
    } catch (e) {
        return res.status(400).json({ error: "reCaptcha error." });
    }
});





export default router;

