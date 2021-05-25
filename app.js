const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');




const app = express();


app.use(helmet()) //temel http security islemleri, 14tane middeleware bulunur, header ekleriz htst gibi.. 

//api urli altina ayni IP ile 1 saat icinde sadece 100 istek gelebilir
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Bu IP ile cok fazla requestte bulunuldu, 1 saat sonra tekrar deneyiniz'
  });
app.use('/api', limiter);

app.use(morgan('dev')); //loglar icin
app.use(express.json({ limit : '10kb'}));//Body parser ,body'den read islemleri icin  ve 10kb ile sinirlandirdik

app.use(mongoSanitize());//NoSQL query injection onune gecmek icin ekleriz. Bunu eklemeseydik ornegin; login olurken email yerine {"$gt" : ""} yazarak sifre yerinede olan bir sifreyi koydugumuzda login olabiliyoruz
app.use(xss());//form inputlari ile gelen HTML kodlarini engeller

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => { //app.use'da kullanabilirdik , hemen hemen ayni islevdeler fakat app.all daha global islemlerde kullanilir
    
    next(new AppError('Url bulunamadi : '+req.originalUrl)); //next fonksiyonuna ne zaman bir  parametre verirsek express tarafindan hata olarak algilanir
})

app.use(globalErrorHandler); // Gonderdigimiz tum errorlar burada son bulur

module.exports = app;

