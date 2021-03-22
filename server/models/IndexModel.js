//1. import module sequelize agar bisa create connection ke postgresdb
import Sequelize from 'sequelize';
import config from '../../config/config'

console.log

//2. config database option akan di load dari file .env
const sequelize = new Sequelize(
  config.db_name,
  config.db_username,
  config.db_password,
  {
    dialect: 'postgres'
    ,
    // host: '192.168.100.254'
    host: '104.198.212.208'

  },
);

sequelize
	.authenticate()
	.then(() => console.log('Connection has been established successfully.'))
	.catch(err => console.log(err));

// tambahkan object Sequelize Op dan export spy bisa di pake di controller
const Op = Sequelize.Op;

//3. import all model dan store di variable models
const models = {
  
    province        : sequelize.import('./province.model'),
    city            : sequelize.import('./city.model'),
    kecamatan       : sequelize.import('./kecamatan.model'),
    kodepos         : sequelize.import('./kodepos.model'),
    address         : sequelize.import('./address.model'),
    users           : sequelize.import('./users.model'),
    account         : sequelize.import('./account.model')
};

//4. create relation OneToMany | ManyToMany
Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models);
  }
});

// 5. export sequalize agar bisa di-call di module lain
export { sequelize,Op };
export default models;