const express = require('express');
const morgan = require('morgan');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');

const app = express();

app.use(morgan('dev'));
app.use(express.json());


app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => { //app.use'da kullanabilirdik , hemen hemen ayni islevdeler fakat app.all daha global islemlerde kullanilir
    
    next(new AppError('Url bulunamadi : '+req.originalUrl)); //next fonksiyonuna ne zaman bir  parametre verirsek express tarafindan hata olarak algilanir
})

app.use(globalErrorHandler); // Gonderdigimiz tum errorlar burada son bulur

module.exports = app;

