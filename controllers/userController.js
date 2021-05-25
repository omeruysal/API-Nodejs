const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => { // bu fonksiyon ile requestte gelen tum fieldler icinden sadece istedigimiz fieldleri ayiklariz
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};


exports.getAllUsers = catchAsync( async(req, res) => {

  const users = await User.find();

  res.status(200).json({
    status: 'succss',
    results: users.length,
    data: {
      users
    }
  })

});

exports.updateMe = catchAsync ( async (req,res,next)=>{
    // 1- Client sifre guncellemeye calisirsa bunun onune geceriz
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'Buradan sadece user bilgileri guncellenebilir, bu route kullanilabilir /updatePassword.',
          400
        )
      );
    }
  
    // 2- Istemedigimiz fieldlari ayiklariz ve sadece guncelleme yapacagimiz fieldlari aliriz
    const filteredBody = filterObj(req.body, 'name', 'email');
  
    // 3- Useri belirledigimiz fieldlere gore update ederiz
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });
  
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
})


exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};