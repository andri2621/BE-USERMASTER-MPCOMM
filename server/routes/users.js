import { Router } from 'express';
// import usersCtrl from '../controllers/IndexController'
import indexCtrl from '../controllers/IndexController'
const { runValidation, validationDaftar, validationLogin } = require('../controllers/validation')
const verifyToken = require('./verifyToken')
import axios from "axios";
import AuthHelper from '../helpers/AuthHelper'


const router = Router();

// router.get('/',verifyToken, usersCtrl.readUsersMethod);
// router.get('/:usersId',usersCtrl.findUsersMethod);
// router.post('/',validationDaftar,runValidation,usersCtrl.addUsersMethod);
// router.put('/:usersId',usersCtrl.editUsersMethod);
// router.delete('/:usersId',usersCtrl.deleteUsersMethod);

// router.post('/login',usersCtrl.loginUsersMethod);


router.put('/:usersId', indexCtrl.users.editusersMethod);
router.delete('/:usersId', indexCtrl.users.deleteusersMethod);

router.get('/', indexCtrl.users.requireSignin, indexCtrl.users.findUsersMethod);
router.post('/signup', validationDaftar, runValidation, indexCtrl.users.signup);
router.post('/signin/', validationLogin, runValidation, indexCtrl.users.signin);
router.post('/signout/', indexCtrl.users.signout);


router.get('/all/', indexCtrl.users.readAllUser);
router.get('/cari/:userId', indexCtrl.users.findUser);


router.post('/ubahpassword/', indexCtrl.users.ubahPassword);

router.post('/signup-with-recaptcha', validationDaftar, runValidation, indexCtrl.users.daftarCaptcha);

router.get('/pembelian/:accoId', indexCtrl.users.pembelian);
router.get('/penjualan/:accoId', indexCtrl.users.penjualan);
router.get('/terbanyak/:accoId', indexCtrl.users.terbanyak);







// router.post("/signup-with-recaptcha", async (req, res, next) => {
//     if (!req.body.token) {
//         return res.status(400).json({ error: "reCaptcha token is missing" });
//     }


//     const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=6LfvBY4aAAAAAO7yTghCTqJzVZ8OdDDWB2bqK3DK&response=${req.body.token}`;
//     const response = await axios.post(googleVerifyUrl);
//     const { success } = response.data;
//     if (success) {
//         //Do sign up and store user in database

//         const salt = AuthHelper.makeSalt();
//         const hashPassword = AuthHelper.hashPassword(req.body.user_password, salt);
//         const hashDevice = AuthHelper.hashPassword(req.body.user_device_info, salt);


//         const users = await req.context.models.users.create({
//             user_name: req.body.user_name,
//             user_email: req.body.user_email,
//             user_password: hashPassword,
//             user_device_info: hashDevice,
//             user_salt: salt
//         });

//         return res.status('201').json({
//             message: "user berhasil didaftarkan",
//             data: users
//         })

//         // =====akhir signup=====
//         return res.json({ success: true });
//     } else {
//         return res
//             .status(400)
//             .json({ error: "Invalid Captcha. Try again." });
//     }

// });




export default router;

