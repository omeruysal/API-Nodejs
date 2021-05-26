const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync'); //catchAsync aciklamasi ./utils/catchAsync
const AppError = require('../utils/appError');

exports.getAllTours = catchAsync(async (req, res, next) => {
    //APIFeatures classina request queryimizi ve mongo queryimizi gondeririz. Daha sonra zincirde olan fonksiyolar sirayla query return eder ve en sonunda queryi await ederiz. Tour.find() tek basina(await etmedigimizde) queryi dondurur.Boylece bir queryi zinciri olustururuz(builder pattern gibi) ve request uzerinden gelen queryilere gore modifiye ederiz. Ve pagination limit gibi islemleri await etmeden query iken yapabildigimiz icin await islemi en sonda gerceklesir ve final dataya ulasiriz

    // 2- QUERY EXECUTE EDERIZ
    const features = new APIFeatures(Tour.find(), req.query) //Detayli aciklamalar icin => utils/apiFeauters.js
        .filter() // 1-Query build etme islemleri chain fonksiyonlarinda gerceklesir
        .sort()
        .limit()
        .paginate();
    const tours = await features.query;

    // 3- RESPONSE GONDERIRIZ
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    });
});

//erroru return ederiz cunku etmezsek kod asagiya devam eder
exports.getTour = catchAsync(async (req, res, next) => {
    
    const tour = await Tour.findById(req.params.id).populate('reviews');
    console.log(tour.reviews);
     if(!tour){
       return   next(new AppError('Bu id ye sahip tour bulunmamaktadir', 404)) //throw or return ?? Express patterne gore return
     }
     
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
});

exports.createTour = catchAsync(async (req, res, next) => {

    // const newTour = newTour({}) // Opsiyonel kaydetme islemi
    // newTour.save()

    const newTour = await Tour.create(req.body); //create methoduna array de gonderebiliriz

    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour
        }
    });
});

exports.updateTour = catchAsync(async (req, res, next) => {

    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { // Patch olarak calisir
        new: true, // Bu ozellik sayesinde geri donen tour objesi update olmus olandir, eklemezsek update olmamis olan geri doner
        runValidators: true // Bu ozellik ile schemadaki validatorleri update icin aktiflestirmis oluruz, default olarak update yaparken validator calismaz
    });

    if(!tour){
        return   next(new AppError('Bu id ye sahip tour bulunmamaktadir', 404)) //throw or return ??
      }
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
   const tour = await Tour.findByIdAndDelete(req.params.id)
    if(!tour){
        return   next(new AppError('Bu id ye sahip tour bulunmamaktadir', 404)) //throw or return ??
      }
    res.status(204).json({
        status: 'success',
        data: null
    });

});





exports.checkBody = (req, res, next) => {  //Ornek bir middleware body uzerinde name ya da price olup olmadigina bakar
    if (!req.body.name || !req.body.price) {
        return res.status(400).json({
            status: 'fail',
            message: 'Missing name or price'
        });
    }
    next();
};


exports.checkID = (req, res, next, val) => { //Parametre kontrolu icin ornek bir middleware, ozel olarak 4. parametre olarak val gelir
    console.log(`Tour id is: ${val}`);

    if (req.params.id < 0) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        });
    }
    next();
};