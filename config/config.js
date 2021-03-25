const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || "YOUR_secret_key",
  db_name : "mpcomm",
  db_username : "postgres",
  db_password: "admin",
  CLOUDINARY_CLOUD_NAME : 'codeid',
  CLOUDINARY_API_KEY : '353246269428416',
  CLOUDINARY_API_SECRET: 'XKAOQ-zFiXM4bNv-aNcO7nTmHAE',
  reCaptchaSecret: '6LfvBY4aAAAAAO7yTghCTqJzVZ8OdDDWB2bqK3DK'
}

export default config
