/**
 * Índice de modelos para Turso
 * Ya no se necesitan relaciones de Sequelize, las consultas se hacen con JOINs directos en SQL
 */
const Post = require('./Post');
const Category = require('./Category');
const Author = require('./Author');
const Tag = require('./Tag');
const PostTag = require('./PostTag');
const User = require('./User');
const Role = require('./Role');
const UserRole = require('./UserRole');

// Exportar todos los modelos
module.exports = {
  Post,
  Category,
  Author,
  Tag,
  PostTag,
  User,
  Role,
  UserRole
};
