module.exports = function(app, passport) {
     /* GET home page. */
    app.get('/', function(req, res, next) {
      res.render('index', { title: 'Express' });
    });   
    
    app.get('/user', isLoggedIn, function(req, res) {
        res.json(req.user);
    });
    
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('https://d0tkom-voting.herokuapp.com');
    });
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()) {
      console.log("authenticated");
      return next(); 
    }

    // if they aren't redirect them to the home page
    res.redirect('/');
}

