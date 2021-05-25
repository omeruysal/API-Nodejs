class AppError extends Error{
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // 4** kodlar fail, 5** kodlar error olarak tanimlariz
        this.isOperational = true; // Bu class ile yarattigimiz butun errorlar operational error olacaktir, bir nevi tahmin edebilecegimiz ve bu sayede globalErrorHandle icinde error throw ederken , operational olanlar ve olmayanlara gore ayri islemler yapabiliriz//Ornegin operational errorlar icin detay verebiliriz ve operational olmayan hatalar icin bilgi vermeyebiliriz // g.e. creating a tour without the required fields
    }

    //Error.captureStackTrace(this, this.constructor) ????
}
module.exports = AppError; 


// OPERATIONAL ERRORS : Onceden tahmin edebilecegimiz ve olma ihtimaline karsilik yakaldigimiz errorlar. 
// Invalid path, invalid user input, failed to connect server or db vs.

//PROGRAMMING ERRORS : Developer tarafindan gerceklestirilen hatalar
//Olmayan degiskeni okumaya calismak, async olmadan await kullanmak , req.query yerine req.body kullanmak vs. 