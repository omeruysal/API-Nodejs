const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({mergeParams : true}); // ust routetan gelen parametreleri alabilmek icin (tourRoutes'tan) createReview icinde param.tourId diyerek ulasim saglariz

//router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

// router
//   .route('/:id')
//   .get(reviewController.getReview)
//   .patch(
//     authController.restrictTo('user', 'admin'),
//     reviewController.updateReview
//   )
//   .delete(
//     authController.restrictTo('user', 'admin'),
//     reviewController.deleteReview
//   );

module.exports = router;