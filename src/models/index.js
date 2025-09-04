const Post = require('./Post');
const Category = require('./Category');
const Author = require('./Author');
const Tag = require('./Tag');
const PostTag = require('./PostTag');
const User = require('./User');

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

// Exportar todos los modelos
module.exports = {
  Post,
  Category,
  Author,
  Tag,
  PostTag,
  User
};
