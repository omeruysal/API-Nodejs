module.exports = fn => { // Butun async methodlarimizda try catch yapisini ayri ayri kullanmak yerine tum methodlarimizi cacthAsync tarafindan sarariz ve hepsini tek bir catch ile golabalErorHandlera gondeririz
    return (req, res, next) => {
        fn(req, res, next).catch(err => { next(err) })
    }
}