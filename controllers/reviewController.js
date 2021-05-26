const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter ={};
    if(req.params.tourId) filter = {tour : req.params.tourId} //Request parametreleri icinde tour id var ise o tour'a ait yorumlar getirilir // Ornek url => GET tour/12345/reviews

    const reviews = await Review.find(filter);

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    })
})

exports.createReview = catchAsync(async (req, res, next) => {
    //Nested route izin veririz. Ornek url =>POST tour/12345/reviews
    if(!req.body.tour) req.body.tour = req.params.tourId; //Request body icinde tour idsi yok ise , request paramterelerine bakariz
    if(!req.body.user) req.body.user = req.user.id; //Request body icinde user idsi yok ise, auth ile requeste koydugumuz user uzerinden aliriz
    const newReview = await Review.create(req.body);

    res.status(200).json({
        status: 'success',
        data: {
            newReview
        }
    })
})