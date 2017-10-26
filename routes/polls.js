var Poll = require('../models/poll');
var cuid = require('cuid');

module.exports = function(app, passport) {
 app.get('/api/polls', function(req, res) {
  Poll.find().sort('-dateAdded').exec((err, polls) => {
    if (err) {
      res.status(500).send(err);
    }
    res.json({ polls });
  });
});

 app.get('/api/mypolls', isLoggedIn, function (req, res) {
  Poll.find({userId: req.user.id}).sort('-dateAdded').exec((err, polls) => {
    if (err) {
      res.status(500).send(err);
    }
    res.json({ polls });
  });
});

app.post('/api/polls', isLoggedIn, (req, res) => {
  if (!req.body.poll.title || !req.body.poll.options) {
    res.status(403).end();
  }
  // Let's sanitize inputs
  //newPoll.title = sanitizeHtml(newPoll.title);
  //newPoll.options = sanitizeHtml(newPoll.options);
  var newPoll = new Poll(req.body.poll);
  newPoll.cuid = cuid();
  newPoll.userId = req.user.id;
  newPoll.save((err, saved) => {
    if (err) {
      res.status(500).send(err);
    }
    console.log('saved');
    res.json({ poll: saved });
  });
});

app.get('/api/polls/:cuid', (req, res) => {
  Poll.findOne({ cuid: req.params.cuid }).exec((err, poll) => {
    if (err) {
      res.status(500).send(err);
    }
    res.json({ poll });
  });
});

app.delete('/api/polls/:cuid', isLoggedIn, (req, res) => {
  // The "todo" in this callback function represents the document that was found.
  // It allows you to pass a reference back to the client in case they need a reference for some reason.
  console.log(req.params.cuid);
  
  
  Poll.findOneAndRemove({ cuid: req.params.cuid }, (err, poll) => {  
    if (err) {
      console.log("error 500");
      res.status(500).send(err);
      return;
    }
    if (poll === null) {
      res.status(500).send("not found :(");
      return;
    }
      // We'll create a simple object to send back with a message and the id of the document that was removed
      // You can really do this however you want, though.
      let response = {
          message: "Poll successfully deleted",
          id: poll._id
      };
      res.status(200).send(response);
  });
});



app.post('/api/polls/:cuid/:id', (req, res) => {
  var id = req.params.id;
  Poll.findOne({ cuid: req.params.cuid }).exec((err, poll) => {
    console.log(poll);
    if (err) {
      console.log("error 500");
      res.status(500).send(err);
    }
    
    var currObj = poll.options[id][0];
    currObj.votes++;
    poll.options.set(id, [currObj]);
    

    poll.save(function (err, updatedPoll) {
      if (err) {
        throw err;
      }
      res.json({updatedPoll});
    });
  });
}); 


app.post('/api/polls/:cuid/new/:newVote', isLoggedIn, (req, res) => {
  Poll.findOne({ cuid: req.params.cuid }).exec((err, poll) => {
    console.log(poll);
    if (err) {
      console.log("error 500");
      res.status(500).send(err);
    }
    console.log(poll);
    var title = req.params.newVote;
    console.log(title);
    poll.options.addToSet([[{title: title, votes: 1}]]);
    
  
    poll.save(function (err, updatedPoll) {
      if (err) {
        throw err;
      }
      res.json({updatedPoll});
    });
  });
}); 


};

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
