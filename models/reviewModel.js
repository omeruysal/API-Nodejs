const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review bos olamaz']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review bir tura ait olmali']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review bir usera ait olmali']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.pre(/^find/, function (next) { //buradaa tum find methodlari icin populate islemi yapariz yani user idsi yerine user name gozukur/Tour icin yapmadigimizdan dolayi sadece tour idsi gozukur
  this.populate({
    path: 'user',
    select: 'name'
  })
  next();
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;