var config = require("./config");
var twit = require('twit');
var sentimental = require('Sentimental');

var twitter = new twit({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token: config.access_token,
    access_token_secret: config.access_token_secret
});

var array = [];
var choices = ["BNB_BTC", "ETH_BTC", "TRX_BTC"];
var today = new Date();
// set highest score
var highestScore = -Infinity;
// set highest choice
var highestChoice = null;
for(var i = 0; i < choices.length; i++) {
	(function(i) {
		// add choice to new array
	    array.push(choices[i])
	    // grad 20 tweets from today
	    twitter.get('search/tweets', {
	    	q: '' + choices[i] + ' since:' + today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate(),
	    	count:100
	    }, function(err, data) {
		    // perform sentiment analysis
		   	score = performAnalysis(data['statuses']);
			console.log(choices[i], ":", score);	        
	    });
	})(i)
}

function performAnalysis(tweetSet) {
  //set a results variable
  var results = 0;
  // iterate through the tweets, pulling the text, retweet count, and favorite count
  for(var i = 0; i < tweetSet.length; i++) {
    tweet = tweetSet[i]['text'];
    retweets = tweetSet[i]['retweet_count'];
    favorites = tweetSet[i]['favorite_count'];
    // remove the hastag from the tweet text
    tweet = tweet.replace('#', '');
    // perform sentiment on the text
    var score = sentimental.analyze(tweet)['score'];
    // calculate score
    results += score;
    if(score > 0){
      if(retweets > 0) {
        results += (Math.log(retweets)/Math.log(2));
      }
      if(favorites > 0) {
        results += (Math.log(favorites)/Math.log(2));
      }
    }
    else if(score < 0){
      if(retweets > 0) {
        results -= (Math.log(retweets)/Math.log(2));
      }
      if(favorites > 0) {
        results -= (Math.log(favorites)/Math.log(2));
      }
    }
    else {
      results += 0;
    }
  }
  // return score
  results = results / tweetSet.length;
  return results
}
