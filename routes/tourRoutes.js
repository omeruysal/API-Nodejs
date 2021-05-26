const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// router.param('id', tourController.checkID); //parametre icin uyguladigimiz ornek middleware, bu middleware yerine mongoose pre fonksiyonlarini kullanacagiz

router.use('/:tourId/reviews', reviewRouter); // Nested route ile tourRoutes icinde reviewRouter kullanarak toura ait yorumlari getirirz
router
  .route('/')
  .get(authController.protect,tourController.getAllTours)
  .post(tourController.createTour);



router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect, //Authoraziton
    authController.restrictTo('admin','lead-guide'), // Authentication
    tourController.deleteTour);

module.exports = router;