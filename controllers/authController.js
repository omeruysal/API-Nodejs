const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { promisify } = require('util');


const signToken = id => {
    return jwt.sign({ id }, 'secret', {
        expiresIn: '90d'
    });
};

exports.signup = catchAsync(async (req, res, next) => {

    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    })
    const token = signToken(newUser._id)

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
});


exports.login = catchAsync(async (req, res, next) => {

    const { email, password } = req.body;

    // 1-Email ve password body de var mi diye bakariz, kodun devam etmemesi icin hatayi return ederiz
    if (!email || !password) {
        return next(new AppError('Email ya da passoword eksik', 400));
    }
    // 2-e Emaile gore user bulunur
    const user = await User.findOne({ email }).select('+password'); //password istedigimizi belirtiriz aksi takdirde password gelmez


    if (!user || !(await user.correctPassword(password, user.password))) { //user bulunmadiysa sag taraftaki kosula girmeyecektir ve bu sayede o satirdan bir hata almayiz eger user yoksa
        return next(new AppError('Hatali sifre ya da password', 401));
    }

    const token = signToken(user._id)


    res.status(200).json({
        status: 'success',
        token
    })

});

//API Authentication bu fonksiyon ile saglanir
exports.protect = catchAsync(async (req, res, next) => {

    // 1- Headerlar var mi bakariz, Auth headeri varsa tokeni aliriz
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) { // token yoksa hata firlatiriz
        return next(
            new AppError('Lutfen giris yapiniz.', 401)
        );
    }

    
    // 2- Tokeni verify ederiz, guncel mi dogru mu gibi
    const decoded = await promisify(jwt.verify)(token, 'secret'); //promisify kullanarak await edebiliriz bu sayede event loop blocklanmaz. sadece jwt.verify olarakta kullanabilirdik

    // 3- Decoded veriden id yardimiyla userin varligini kontrol ederiz
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('Tokena sahip olan user artik var olmamaktadir', 401));
    }

    // 4- Decodedtan aldigimiz time ile passwordun degistirildigi zamani karsilastiririz, eger token alindiktan sonra password guncellendiyse token gecersizdir
    if (currentUser.changedPasswordAfter(decoded.iat)) { // NOT: simdilik password guncelleme ozelligi yok.
        return next(new AppError('User password bilgisini guncellemistir lutfen giris yapiniz.', 401));
    }

    // User bilgisini requeste koyariz ki ilerde faydalanabilelim
    req.user = currentUser;
    next();
});


exports.restrictTo = (...roles) => { //middleware cagirdigimiz yerde parametre gonderdigimiz icin parametre alabilmek icin fonksiyon icinde fonksyion dondururuz
    return (req, res, next) => {
        // roles ['admin', 'lead-guide']. role='user'
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('Yetkiniz yoktur', 403)
            );
        }

        next();
    };
};

exports.updatePassword = catchAsync(async (req, res, next) => {

    //Useri collectiondan cekeriz
    const user = await User.findById(req.user.id).select('+password') //password default olarak selected:false dedigimiz icin artik getirmek istedigimiz yerlerde bu sekilde cagiririz

    //Clienttan gelen currentPasswordu kontrol ederiz
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) { // arkaplanda bcrpyt.compare ile karsilastirma yapariz
        return next(new AppError('Current Password hatali', 401))
    }

    //useri guncelleriz, kisaca findByIdAndUpdate yapmadik cunku validator kullaniyoruz. { runValidators: true } desek bile find methodlari this keywordunu obje icin kullanamaz. (passwordConfirm validatoru this keywordu kullanmaktadir bunun etkin olabilmesi icin save kullaniriz)
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save(); //Diger validatorler neden calismadi diye bir soru dusunursek onun cevabi; zaten var olan bir document ile save methodu cagirdigimizda update islemi yapar. Diger fieldler zaten validationa uygundur

    const token = signToken(user._id)
    

    res.status(200).json({
        status: 'success',
        token
    })
})