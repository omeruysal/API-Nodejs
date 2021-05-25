const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
//const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name alani zorunludur']
    },
    email: {
        type: String,
        required: [true, 'email fieldi zorunludur'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'uygun bir mail girilmesi gerekmektedir']
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'password fieldi zorunludur'],
        minlength: 8,
        select: false //Password bilgisinin gozukmesini isteedigimiz icin false yapariz
    },
    passwordConfirm: {
        type: String,
        required: [true, 'passwordConfirm fieldi zorunludur'],
        validate: {
            // sadece create ve save ile calisir 
            validator: function (el) {
                return el === this.password;
            },
            message: 'Sifreler ayni olamaz'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.pre('save', async function(next) {
    // Password degiskeninde degisiklik olmadiysa hashlemeyiz ve devam ederiz
    if (!this.isModified('password')) {
        return next();
    }
  
    // CPU gucune gore sifreyi hashleriz
    this.password = await bcrypt.hash(this.password, 12);
  
    // Ve passwordConfirm bilgisini sileriz
    this.passwordConfirm = undefined;
    next();
  });

  //normalde this.password diyerekte userPasswordu elde edebilirdik fakat password icin select:false yaptigimizdan dolayi parametre olarak almaliyiz
  userSchema.methods.correctPassword = async function( candidatePassword,userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
  };

//tokendan gelen iat ile password guncellenme zamanini kontrol ederiz, token alindiktan sonra sifre degistiyse yeniden token alinmalidir
  userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) { // Password icin herhangi bir guncelleme yok ise passwordChangedAt zaten olmayacaktir, devam edebilir. Guncellendiyse sure kontrolu yapilir
      const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10 );
  
      return JWTTimestamp < changedTimestamp;
    }
  
    //false donuyorsa degisiklik yok demektir
    return false;
  };

const User = mongoose.model('User', userSchema);
module.exports = User;