const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  auth0Id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'auth0_id'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  nickname: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [2, 50]
    }
  },
  picture: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'email_verified'
  },
  locale: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'es'
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  defaultRoleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'default_role_id',
    references: {
      model: 'roles',
      key: 'id'
    }
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['auth0_id']
    },
    {
      unique: true,
      fields: ['email']
    }
  ]
});

module.exports = User;
