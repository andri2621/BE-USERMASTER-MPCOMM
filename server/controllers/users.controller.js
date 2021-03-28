import { Router } from 'express';
// import { sequelize, Op } from '../models/index';
import { sequelize, Op } from '../models/IndexModel';

import AuthHelper from '../helpers/AuthHelper'
import config from '../../config/config'
import jwt from 'jsonwebtoken'
import expressJwt from 'express-jwt'
import axios from "axios";





// create user with hash & salt
const signup = async (req, res) => {
  //const { user_name, user_email, user_password } = req.body;

  const { dataValues } = new req.context.models.users(req.body);


  const emailUser = await req.context.models.users.findOne({ where: { user_email: dataValues.user_email } })

  if (emailUser) {
    return res.status(404).json({
      status: false,
      message: 'email sudah terdaftar, silakan login'
    })
  }


  const salt = AuthHelper.makeSalt();
  const hashPassword = AuthHelper.hashPassword(dataValues.user_password, salt);
  const hashDevice = AuthHelper.hashPassword(dataValues.user_device_info, salt);


  const users = await req.context.models.users.create({
    user_name: dataValues.user_name,
    user_email: dataValues.user_email,
    user_password: hashPassword,
    user_device_info: hashDevice,
    user_salt: salt
  });

  return res.status('201').json({
    message: "user berhasil didaftarkan",
    data: users
  })
}



//filter pencarian data dengan primary key
const readAllUser = async (req, res) => {
  try {
    const users = await req.context.models.users.findAll();
    return await res.send(users);
  } catch (err) {
    return await res.status('400').json({
      status: false,
      message: "tidak dapat mendapatkan data user",
      data: users

    });
  } 
};





// filter find by user_email
const signin = async (req, res) => {
  //1. extract values from request body
  const { user_email, user_password } = req.body

  //2. gunakan try catch, agar jika terjadi error misal table ga bisa diakses bisa munculkan error message
  try {

    // idem : select * from users where user_email = :user_email
    const datauser = await req.context.models.users.findOne({
      where: { user_email: user_email }, include: [{ model: req.context.models.account }]
    });
    // console.log(datauser)

    //3. jika user tidak ketemu munculkan error
    if (!datauser) {
      return res.status('400').json({
        status: false,
        message: "User belum terdaftar"
      });
    }

    //3. check apakah user_password di table === user_passowrd yg di entry dari body,
    // tambahkan salt
    if (!AuthHelper.authenticate(user_password, datauser.dataValues.user_password, datauser.dataValues.user_salt)) {
      return res.status('401').json({
        status: false,
        message: "Password salah"

      })
    }

    //4. generate token jwt, jangan lupa tambahkan jwtSecret value di file config.js
    const token = jwt.sign({
      _id: datauser.user_id,
      _userName: datauser.user_name,
      _userEmail: datauser.user_email,

    }, config.jwtSecret)



    //5. set expire cookie
    res.cookie("t", token, {
      expire: new Date() + 9999
    })





    // ===========================




    //6. exclude value user_password & user_salt, agar tidak tampil di front-end
    // lalu send dengan include token, it's done
    const { account } = datauser.dataValues;
    if (account == undefined) {
      return res.
        // status().send(401)
        json({
          token, users: {
            user_id: datauser.dataValues.user_id,
            user_name: datauser.dataValues.user_name,
            user_email: datauser.dataValues.user_email,
            accounts: null

          }
        });
    }
    else {
      return res.json({
        token, users: {
          user_id: datauser.dataValues.user_id,
          user_name: datauser.dataValues.user_name,
          user_email: datauser.dataValues.user_email,
          accounts: account.dataValues



        }
      });
    }



  } catch (err) {
    return res.status('400').json({
      status: false,
      message: "tidak dapat mendapatkan data user",
      data: users

    });

  }


}



// findAll = select from users yang login
const findUsersMethod = async (req, res) => {
  // console.log(req.context.user_id)

  const user = await req.context.models.users.findOne()
  console.log(user)
  // const user = await req.context.models.users.findOne({_id : req.id, attributes : {exclude : [ 'user_password', 'user_salt']}}  );
  return res.status(200).json({
    message: 'berhasil dipanggil',
    data: user
  })
}

const findUser = async (req,res) => {
  const users = await req.context.models.users.findByPk(req.params.userId);
  return res.send(users);
};


const signout = (req, res) => {
  res.clearCookie("t")
  return res.status('200').json({
    message: "signed out"
  })
}


const requireSignin = expressJwt({
  secret: config.jwtSecret,
  userProperty: 'auth',
  algorithms: ['sha1', 'RS256', 'HS256']
})


//ubah data
// Change everyone without a last name to "Doe"
const editusersMethod = async (req, res) => {
  const { user_name, user_email, user_password, user_device_info } = req.body.data;
  const users = await req.context.models.users.update({
    user_name: user_name,
    user_email: user_email,
    user_password: user_password,
    user_device_info: user_device_info
  }, {
    where: { user_id: req.params.usersId }
  });
  return res.sendStatus(200);
};

//hapus data
const deleteusersMethod = async (req, res) => {
  const result = await req.context.models.users.destroy({
    where: { user_id: req.params.usersId },
  });

  return res.send(true);
};


//ubah data


const ubahPassword = async (req, res) => {
  const { user_email, user_password , newpassword } = req.body
  console.log('password', user_password)

  const users = await req.context.models.users.findOne({ where: { user_email: user_email } })
  if (!AuthHelper.authenticate(user_password, users.dataValues.user_password, users.dataValues.user_salt)) {
    return res.status('401').json({
      status: false,
      message: "Password salah"
    })
  }
  
  
  const salt = AuthHelper.makeSalt();
  const hashPassword = AuthHelper.hashPassword(newpassword, salt);


  const dataUsers = await req.context.models.users.update({
    user_password: hashPassword,
    user_salt: salt 
  }, {
    where: { user_email: user_email } 
    });

  return res.status('201').json({
    message: "berhasil diubah",
    data: dataUsers
  })


}


const daftarCaptcha = async (req, res, next) => {

  // const { dataValues } = new req.context.models.users(req.body);


  
  
  if (!req.body.token) {
    return res.status(400).json({ error: "reCaptcha token is missing" });
  }
  
  
  const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=6LfvBY4aAAAAAO7yTghCTqJzVZ8OdDDWB2bqK3DK&response=${req.body.token}`;
  const response = await axios.post(googleVerifyUrl);
  const { success } = response.data;
  if (success) {
    //Do sign up and store user in database
      const emailUser = await req.context.models.users.findOne({ where: { user_email: req.body.user_email } })
    
      if (emailUser) {
        return res.status(404).json({
          status: false,
          message: 'email sudah terdaftar, silakan login'
        })
      }

      const salt = AuthHelper.makeSalt();
      const hashPassword = AuthHelper.hashPassword(req.body.user_password, salt);
      const hashDevice = AuthHelper.hashPassword(req.body.user_device_info, salt);


      const users = await req.context.models.users.create({
          user_name: req.body.user_name,
          user_email: req.body.user_email,
          user_password: hashPassword,
          user_device_info: hashDevice,
          user_salt: salt
      });

      return res.status('201').json({
          message: "user berhasil didaftarkan",
          data: users
      })

      // =====akhir signup=====
      return res.json({ success: true });
  } else {
      return res
          .status(400)
          .json({ error: "Invalid Captcha. Try again." });
  }


}



const pembelian = async (req, res) => {
  // console.log(req.context.user_id)

  const daftarPembelian = await sequelize.query(
    `select order_name, acco_id, acco_nama, 
    order_acco_id_seller,(select acco_nama from account where acco_id = order_acco_id_seller) as seller, 
    prod_id, prod_name, order_total_qty, prim_path, order_total_due,order_weight, 
    order_created_on, order_stat_name  
    from account join orders  on acco_id = order_acco_id 
    join orders_line_items on order_name = orit_order_name 
    join product on orit_prod_id = prod_id 
    join product_images on prod_id = prim_prod_id 
    where acco_id = :acco_id and order_stat_name not in ('CHECKOUT') and order_stat_name = 'ARRIVED' 
    or acco_id = :acco_id and order_stat_name = 'CLOSED'`
    ,
    { replacements: { acco_id: req.params.accoId }, type: sequelize.QueryTypes.SELECT }
  );
  return res.send(daftarPembelian);
  
}

const penjualan = async (req, res) => {
  // console.log(req.context.user_id)

  const daftarPenjualan = await sequelize.query(
    `select order_name, acco_id, acco_nama, 
    order_acco_id_seller,(select acco_nama from account where acco_id = order_acco_id_seller) as seller, 
    prod_id, prod_name, order_total_qty, prim_path, order_total_due,order_weight,
    order_created_on,order_stat_name  
    from account join orders 
    on acco_id = order_acco_id join orders_line_items 
    on order_name = orit_order_name join product 
    on orit_prod_id = prod_id join product_images 
    on prod_id = prim_prod_id 
    where order_acco_id_seller = :acco_id
    and order_stat_name = 'ARRIVED' 
    or order_acco_id_seller = :acco_id and order_stat_name = 'CLOSED'`
    ,
    { replacements: { acco_id: req.params.accoId }, type: sequelize.QueryTypes.SELECT }
  );
  return res.send(daftarPenjualan);
  
}


const terbanyak = async (req, res) => {
  // console.log(req.context.user_id)

  const penjualanTerbanyak = await sequelize.query(
    `select prim_path, prod_name, prod_price, orit_subtotal, count(orit_prod_id) as total 
    from account join orders 
    on acco_id = order_acco_id join orders_line_items 
    on order_name = orit_order_name join product 
    on orit_prod_id = prod_id join product_images 
    on prod_id = prim_prod_id 
    where order_acco_id_seller = 1031
    and order_stat_name = 'ARRIVED' 
    or order_acco_id_seller = 1031 and order_stat_name = 'CLOSED'
    group by prim_path,prod_name, orit_prod_id, prod_price, orit_subtotal
    order by total desc`
    ,
    { replacements: { acco_id: req.params.accoId }, type: sequelize.QueryTypes.SELECT }
  );
  return res.send(penjualanTerbanyak);
  
}


// Gunakan export default agar semua function bisa dipakai di file lain.
export default {

  deleteusersMethod,
  editusersMethod,
  readAllUser,
  findUsersMethod,
  signup,
  signin,
  requireSignin,
  ubahPassword,
  signout,
  findUser,

  daftarCaptcha,

  pembelian,
  penjualan,
  terbanyak
}