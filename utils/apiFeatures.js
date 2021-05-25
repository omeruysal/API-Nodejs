class APIFeatures { //Sayfa sonunda aciklamalar bulunmaktadir.
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        // 1- QUERY BUILD EDERIZ

        // a-Genel filtreleme
        const queryObj = { ...this.queryString } //req.query nin bir kopyasini yapariz, queryObj = req.query yapsaydik daha sonra queryObj deki degisiklikler req.queryide etkilerdi
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach(el => delete queryObj[el]); //forEach kullandik cunku yeni array dondurmek istemiyoruz // queryObj uzerinde belirledigimiz alanlari cikartiriz ve sadece fieldlar tarafindan filtreleme yapilacak queryler kalir

        // b-Gelismis filtreleme
        let queryStr = JSON.stringify(queryObj)//stringfy ile js objesini Json stringine donustururuz  { price: '397' }=>{"price":"397"} - Bu ornekte replace methodu kullanabilmek icin
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$ ${match}`) //Request uzerinden query olarak gelen gte lt vs gibi filtrelerin basina $ koyariz, mongoose objesi uzerinden direkt olarak kullanabilmek icin


        // console.log(req.query  ,queryObj);// ===> { price: '397', sort: 'true' } { price: '397' }
        // console.log(await Tour.find(queryObj));
        // console.log("------------------------------------------------------");
        // console.log( Tour.find(queryObj));


        //  let query =  Tour.find(JSON.parse(queryStr)) //find methodu tek basina query dondurur fakat await kullandigimizda document olarak execute olur. Await ile cagirma yaptiktan sonra, sort limit pagination gibi islemler yapamayiz. Bu yuzden once istedigimiz ozelliklere gore(sort pagination vs) query elde ederiz daha sonra await ile fetch ederiz
       this.query = this.query.find(JSON.parse(queryStr))  // Tour.find() querysi obje yaratilirken gonderildigi icin artik this.query olarak erisim saglariz
        return this;
    }

    sort() {
        // c- Siralama //Sort querysi var ise, //?sort=price
        if (this.queryString.sort) {
            this.query = this.query.sort(this.queryString.sort) // Tour.find yaparken await kullanmadigimiz icin query elde ettik ve queryi modife ediyoruz -- sort=price asc olarak, sort=-price desc olarak calisir 
        }
        else {   //Herhangi bir sort querysi yok ise default olarak tarihe gore siralama yapariz
            this.query = this.query.sort('-createdAt')
        }
        return this;
    }

    limit() {
        // d- Response'a eklenecek fieldleri limitleme //?fields=name,duration,price
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields)
        }
        else { //tum alanlar isteniyorsa, -__v diyerek gelen responsetan sadece v fieldini cikartiriz
           this.query = this.query.select('-__v')
        }
        return this;
    }

    paginate(){
        // e- Pagination
        const page = this.queryString.page * 1 || 1; // Page querysi varsa 1 ile carparak number tipine ceviririz (TIP), eger page belirtilmediyse default 1 olur
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;


    }
}

module.exports = APIFeatures;


// Model.find() methodu query return eder. (await etmedigimiz durumda, await edersek saf data return eder ve bu saf data mongoose ile modifiye edilemez)
// Bu classa bir Model.find() querysi bir de requestten gelen queryleri gondeririz
// getAll methodlarinda kullandigimiz chain methodlar sayesinde sirayla tum fonksiyonlari cagiririz ve bu methodlar builder patternde oldugu gibi sinifin objesini return eder
// Bir fonksiyonu cagirdik, eger o fonksiyonun query ismi request query uzerinde bulunuyorsa, Model.find ile gelen mongo queryimiz modifiye edilir ve return edilir, eger bulunmuyorsa sadece return edilir
// Bu sayede 4 fonksiyonuda cagiririz ve gerekli query parametreleri request query uzerinde bulunuyorsa modifiye edilir
// En son da ise await ederek queryimiz dataya execute edilir