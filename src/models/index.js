const Post = require('./Post');
const Category = require('./Category');
const Author = require('./Author');
const Tag = require('./Tag');
const PostTag = require('./PostTag');
const User = require('./User');
const Role = require('./Role');
const UserRole = require('./UserRole');

// Definir las relaciones entre modelos

// Post pertenece a Category
Post.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

// Category tiene muchos Posts
Category.hasMany(Post, {
  foreignKey: 'category_id',
  as: 'posts'
});

// Post pertenece a Author
Post.belongsTo(Author, {
  foreignKey: 'author_id',
  as: 'author'
});

// Author tiene muchos Posts
Author.hasMany(Post, {
  foreignKey: 'author_id',
  as: 'posts'
});

// Relación Many-to-Many entre Post y Tag a través de PostTag
Post.belongsToMany(Tag, {
  through: PostTag,
  foreignKey: 'post_id',
  otherKey: 'tag_id',
  as: 'tags'
});

Tag.belongsToMany(Post, {
  through: PostTag,
  foreignKey: 'tag_id',
  otherKey: 'post_id',
  as: 'posts'
});

// Relaciones de User y Role (Many-to-Many)
User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: 'user_id',
  otherKey: 'role_id',
  as: 'roles'
});

Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: 'role_id',
  otherKey: 'user_id',
  as: 'users'
});

// Relación directa de User con Role por defecto
User.belongsTo(Role, {
  foreignKey: 'default_role_id',
  as: 'defaultRole'
});

Role.hasMany(User, {
  foreignKey: 'default_role_id',
  as: 'defaultUsers'
});

// Relaciones adicionales para UserRole
UserRole.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

UserRole.belongsTo(Role, {
  foreignKey: 'role_id',
  as: 'role'
});

UserRole.belongsTo(User, {
  foreignKey: 'assigned_by',
  as: 'assignedByUser'
});

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
