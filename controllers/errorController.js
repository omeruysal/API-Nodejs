module.exports = (err, req, res, next) => {
    console.log(err.stack);
    console.log("geldi");
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error'
    

    res.status(err.statusCode).json({
        status : err.status,
        message : err.message
    })
}

//   OPERATIONAL  ==> isOperationa alani sayesinde bizim throw ettigimiz errorlar ile , throw etmediklerimiz arasinda ayrim yaparak ona gore cliente gonderim yapabiliriz
// if(error.isOperational){
//     res.status(error.statusCode).json({
//         status : error.status,
//         message : error.message
//     })
// }else{
//     res.status(500).json({
//     status : 'error',
//     message : 'Birseyler ters gitti'
//     })
// }