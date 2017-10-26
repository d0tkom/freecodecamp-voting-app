module.exports = function(app, passport) {
	    // =====================================
    // TWITTER ROUTES ======================
    // =====================================
    // route for twitter authentication and login
    app.get('/auth/twitter', passport.authenticate('twitter'));

    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect : 'https://d0tkom-voting.herokuapp.com/mypolls',
            failureRedirect : '/error'
        }));
}