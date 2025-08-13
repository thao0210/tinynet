const mongoose = require('mongoose');

const TranslationSchema = new mongoose.Schema({
  lang: { type: String, required: true },
  title: { type: String },
  titleNoAccent: { type: String },
  content: { type: String, required: true },
  text: { type: String },
  textNoAccent: { type: String }
}, { _id: false });

module.exports = TranslationSchema;
