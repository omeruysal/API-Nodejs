const mongoose = require('mongoose');
const app = require('./app');

mongoose.connect("mongodb://localhost/tour-app",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
mongoose.connection.once("open", () => console.log("We connected to mongo"))
    .on("error", error => {
        console.log("Error is for mongodb ", error);
    })

const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err=>{ //unhanled hatalar gerceklestiginde yani bir yerde try catch ile hatayi almadiysak ya da catch kullanmayi unuttuysak buradan firlatacagiz
    console.log('UNHANDLED REJECTION hatasi gerceklesti');
    console.log(err.name);
    console.log(err.message);
    console.log(err);
})