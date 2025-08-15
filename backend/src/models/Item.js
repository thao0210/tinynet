const mongoose = require('mongoose');
const removeAccents = require('remove-accents');
const TranslationSchema = require('./Translation');

const ItemSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: { type: Date, default: Date.now },
    privacy: { type: String, enum: ['public', 'share', 'private'], required: true },
    type: {
      type: String,
      enum: [
        'collection',
        'story',
        'card',
        'drawing',
        'coloring',
        'music',
        'shareUrl',
        'vote',
        'deal',
        'cv',
        'challenge',
        'contest',
        'others'
      ],
      required: true
    },
    title: { type: String, required: true },
    titleNoAccent: { type: String }, 
    showOnlyInCollection: {type: Boolean, default: false},
    sharedWith: [{ type: String }],
    restrictedAccess: {type: Boolean, default: false},
    password: { type: String },
    passwordHint: {type: String},
    sendOtp: {type: Boolean, default: false},
    showTitle: {type: Boolean, default: true},
    views: { type: Number, default: 0 },
    noOfComments: { type: Number, default: 0 },
    commentsBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    noOfLikes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isLiked: {type: Boolean, default: false},
    allowComments: {type: Boolean, default: true},
    itemPoints: { type: Number, default: 0 },
    isPromoted: {type: Boolean, default: false},
    promoteStart: {type: Date},
    promoteEnd: {type: Date},
    isAnonymous: { type: Boolean, default: false },
    isFriendlyUrl: { type: Boolean, default: false },
    slug: { type: String, unique: true, sparse: true },
  });
  
  // Tạo model gốc
  const Item = mongoose.model("Item", ItemSchema);
  ItemSchema.pre('save', function (next) {
    if (this.title) this.titleNoAccent = removeAccents(this.title).toLowerCase();
    next();
  });
  // =======================
  //  Các Schema Con
  // =======================

  // Story Schema
  const StorySchema = new mongoose.Schema({
    language: { type: String },
    themeType: {type: String, default: null},
    theme: {type: String, default: '#ffffff'},
    themeShape: {
      name: String,
      group: String,
      background: String,
      shapeColorType: String,
      shapeColor: mongoose.Schema.Types.Mixed,
      count: Number,
      opacity: Number
    },
    content: { type: String, required: true },
    text: { type: String},
    textNoAccent: { type: String },
    translations: [TranslationSchema],
    storyCategory: String,
    backgroundMusic: {type: String},
    allowContribution: {type: Boolean, default: false}
  });

  StorySchema.pre('save', function (next) {
    if (this.text) this.textNoAccent = removeAccents(this.text).toLowerCase();
    if (Array.isArray(this.translations)) {
      this.translations = this.translations.map((t) => {
        const updated = { ...t.toObject?.() || t };

        if (t.text) updated.textNoAccent = removeAccents(t.text).toLowerCase();
        if (t.title) updated.titleNoAccent = removeAccents(t.title).toLowerCase();

        return updated;
      });
    }
    next();
  });
  const Story = Item.discriminator("story", StorySchema);

  // Drawing Schema
  const DrawingSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    drawingCategory: String,
    savedPaths: { type: String },
    canEdit: {type: Boolean, default: false},
    hasBg: {type: Boolean, default: false}
  });
  const Drawing = Item.discriminator("drawing", DrawingSchema);

  // Card Schema
  const CardSchema = new mongoose.Schema({
    cardDetails: { type: mongoose.Schema.Types.Mixed, required: true },
    thumbnailImage: String,
    cardTextContent: { type: String, default: '' }
  });
  const Card = Item.discriminator("card", CardSchema);

  // Share Schema
  const ShareSchema = new mongoose.Schema({
    url: { type: String, required: true },
    preview: String
  });
  const Share = Item.discriminator("shareUrl", ShareSchema);

  // Collection Schema
  const CollectionSchema = new mongoose.Schema({
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }]
  });
  const Collection = Item.discriminator("collection", CollectionSchema);

  // Vote Schema
  const VoteSchema = new mongoose.Schema({
    voteMode: {
      type: String,
      enum: ['only-one', 'multi'],
      default: 'only-one'
    },
    voteType: {
      type: String,
      enum: ['posts', 'users', 'custom'],
      required: true
    },
    items: [{type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
    itemsView: [{ 
      item: {type: mongoose.Schema.Types.ObjectId, ref: "Item" },
      noOfVotes: {type: Number, default: 0},
      votedUsers: [{type: mongoose.Schema.Types.ObjectId, ref: "User" }]
    }],
    users: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    usersView: [{ 
      user: {type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
      noOfVotes: {type: Number, default: 0},
      votedUsers: [{type: mongoose.Schema.Types.ObjectId, ref: "User" }]
    }],
    customOptions: [
      {
        content: String,
        image: String, // URL ảnh nếu có
        noOfVotes: {type: Number, default: 0},
        votedUsers: [{type: mongoose.Schema.Types.ObjectId, ref: "User" }]
      }
    ],
    timezone: String,
    deadline: String,
    voteReward: {type: Number, default: 0},
    maxVoters: {type: Number, default: 0},
    winnerReward: {type: Number, default: 0},
    description: String
  });
  const Vote = Item.discriminator("vote", VoteSchema);

  // Export models
  module.exports = { Item, Story, Drawing, Share, Collection, Vote, Card };
