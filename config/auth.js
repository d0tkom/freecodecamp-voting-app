'use strict';

module.exports = {
	'twitterAuth': {
		'clientID': process.env.TWITTER_CLIENT_ID,
		'clientSecret': process.env.TWITTER_CLIENT_SECRET,
		'callbackURL': 'https://d0tkom-voting.herokuapp.com/auth/twitter/callback'
	}
};
