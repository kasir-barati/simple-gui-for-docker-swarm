const pageNotFound = (req, res, next) => { 
    const messages = req.flash('messages');
    const errorMessages = req.flash('errorMessages');

    res.render('404', {
        messages,
        errorMessages,
        pageTitle: 'Ariana-Cloud - 404 page'
    });
};

const errorOccurred = (error, req, res, next) => { 
    const messages = req.flash('messages');
    const errorMessages = req.flash('errorMessages');

    console.error(error);
    res.render('500.ejs', { 
        messages,
        errorMessages,
        errorTitle: 'مشکل از سمت سروره',
        pageTitle: 'Ariana-Cloud - 500 page',
        errorMessage: 'یه اروری سمت سرور رخ داده که برنامه نویسمون یادش رفته یا اصلا متوجهش نبوده.'
    });
};

process.on('unhandledRejection', error => {
    console.error(error);
    process.exit(1);
});

module.exports = {
    pageNotFound,
    errorOccurred
};