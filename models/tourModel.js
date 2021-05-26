const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'name bilgisi tur objesi icin zorunludur'],
        unique: true,
        trim: true //Stringin basindaki ve sonundaki bosluklari silmek icin
    },
    duration: {
        type: Number,
        required: [true, 'duration bilgisi tur objesi icin zorunludur']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'maxGroupSize bilgisi tur objesi icin zorunludur']
    },
    difficulty: {
        type: String,
        required: [true, 'difficulty bilgisi tur objesi icin zorunludur'],
        enum: {
            values: ['easy', 'normal', 'difficult'],
            message: 'difficulty easy normal ya da difficult olmalidir'
        }
    },
    ratingsAverage: { //Bu ozellik yorumlara gore hesaplanir, o yuzden required degildir
        type: Number,
        default: 4.5
    },
    ratingsQuantity: { //Bu ozellik yorumlara gore hesaplanir, o yuzden required degildir
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'price bilgisi tur objesi icin zorunludur']
    },
    priceDiscount: {
        type: Number,
        validate: { //bu validator sadece create isleminde calisir
            validator: function (value) { //value discountu temsil eder. Eger discount pricedan fazla ise false donecek ve kayit olmayacaktir
                console.log("value : " + value);
                console.log("price : " + this.price);
                return value < this.price;
            },
            message: 'discount pricetan buyuk olamaz'
        }
    },
    summary: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false // Bu field getirilmez
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
     guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]

},

    {
        toJson: { virtuals: true }, // Bu iki true sayesinde virtual fieldler json ve object olarak datalar da gozukur
        toObject: { virtuals: true }
    })

tourSchema.virtual('durationWeeks').get(function () { // Bu virtual field database uzerinde kayit edilmez ve default olarak responselarda gozukmez
    return this.duration / 7;
})

// Virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
  });

//DOCUMENT MIDDLEWARE:sadece save ve create fonksiyonlarindan once calisir, insertMany, update vs oncesinde calismaz
tourSchema.pre('save', function (next) {

    next();
})
//Ornek olarak olusturulmustur
tourSchema.post('save', function (doc, next) {

    next();
})

//QUERY MIDDLEWARE: herhangi bir document soz konusu degildir, queryi process ederiz, asil queryi await olmadan once
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } }) //find ile baslayan butun queryler execute olmadan once buraya gelir ve secretTour true olmayanlari getirmek uzere queryler modifiye edilir
    next();
})
// Butun find methodlari calismadan once this keywordu ile querye mudahale ederiz ve guides bilgisini id yerine obje olarak getirmesi gerektiginide soyleriz
tourSchema.pre(/^find/, function(next) {
    this.populate({
      path: 'guides',
      select: '-__v'
    });
  
    next();
  });
const Tour = mongoose.model('Tour', tourSchema);


module.exports = Tour;

//Mongoose uzerinde 4 tip middleware bulunmaktadir ; document , query, aggregate, model
//Document middleware o an bulunan document icindir; validate save remove 
//Query middleware belirledigimiz queryler icindir; find findOne count update remove vs