hash_map = new Object();
all_tweets = [];
checked_users = [];
all_users=[];
var create_xhr = function() {
	var xhr;
	if (window.XMLHttpRequest)
  	{// code for IE7+, Firefox, Chrome, Opera, Safari
  		xhr=new XMLHttpRequest();
  	}
	else
  	{// code for IE6, IE5
  		xhr=new ActiveXObject("Microsoft.XMLHTTP");
  	}
  	return xhr;
}

var remove_all_children = function(parentNode) {
	while (parentNode.firstChild) {
   		parentNode.removeChild(parentNode.firstChild);
	}
}

var set_new_hashtags = function(updated_set_hashtags) {
	var container = document.getElementById("hash_tags");
 	if(Object.keys(updated_set_hashtags).length > 0) {
 		remove_all_children(container);

		for(var h in updated_set_hashtags) {
			var li = document.createElement("a");
            li.setAttribute('href',"#");
			li.setAttribute('id', h);
			li.setAttribute('class', 'hashtag')
			li.appendChild(document.createTextNode('#'+ h + '(' + updated_set_hashtags[h] + ')'));
			li.onclick = attach(li.id);
                        li.setAttribute('style','padding-right:10px;');
		
			container.appendChild(li);
		}
 	}
}

var update_feed_with_hashtweets = function(tag) {
	var updated_set_hashtags = {};
	var feed_container = document.getElementById("tweets_of_users");
	remove_all_children(feed_container);
	var visited={};
	var hashtweet = hash_map[tag];
	for(var i=0; i<hashtweet.length; i++) {
		for(var t in all_tweets){
			if(all_tweets[t].id_str == hashtweet[i].tweet.id_str && checked_users.indexOf(all_tweets[t].user.id_str)!= -1 &&!visited[tag]) {
				var tweetContainer = buildTweetContainer(all_tweets[t].user, all_tweets[t]);
				feed_container.appendChild(tweetContainer);
				var entities_hashtags = hashtweet[i].tweet.entities.hashtags;
				visited[tag]=1;
				for(var entity in entities_hashtags) {
					if(!(updated_set_hashtags[entities_hashtags[entity].text])) {
						updated_set_hashtags[entities_hashtags[entity].text] = 1;
					} else {
						updated_set_hashtags[entities_hashtags[entity].text]++;
					}
				}
			}
		}
	}
	set_new_hashtags(updated_set_hashtags);
}

var attach = function(hashtag) {
	return function() {
		update_feed_with_hashtweets(hashtag);
	};
}

var dateComparator = function(t1, t2) {
	var dateOne = new Date(t1.created_at);
	var dateTwo = new Date(t2.created_at);
	
	if(dateOne < dateTwo) return 1;
	else if(dateOne == dateTwo) return 0;
	else return -1;
}



var update_hashtags_container = function() {
	var container = document.getElementById("hash_tags");
	remove_all_children(container);
	
	for(var h in hash_map) { 
        var count=0;
        for(var person in checked_users)
           {
               for(var tag in hash_map[h])
               {
                   if(hash_map[h][tag].parent.id_str===checked_users[person])
                    count++;
               }
           }
        if(count)
            {
              var li = document.createElement("a");
                     li.setAttribute('href',"#");
		      li.setAttribute('id', h);
		      li.setAttribute('class', 'hashtag');
		      li.appendChild(document.createTextNode('#'+ h + '(' + count + ')'));
                      li.setAttribute('style','padding-right:10px;')
              li.onclick = attach(li.id);
              container.appendChild(li);
            }
		
		
	}
}

var get_feed = function(obj) {
	var errors = false;
	var xhr = create_xhr();
	var url = 'index.php?query=feed&screen_name='+obj.screen_name+'&count=20';
	xhr.onreadystatechange = function() {
		if(xhr.readyState == 4 && xhr.status == 200) {
			var json = xhr.responseText;
			var json_obj = JSON.parse(json);
		
			for(var t in json_obj) {
				all_tweets.push(json_obj[t]);
			}
			all_tweets = all_tweets.sort(dateComparator);

			for(var t in json_obj) {
				if(json_obj[t].entities.hashtags.length > 0) {
					var hashtags = json_obj[t].entities.hashtags;
					for(var h in hashtags) {
						var array;	
						if(!(hash_map[hashtags[h].text])) {
							array = [];
						} else {
							array = hash_map[hashtags[h].text];
						}
						
						obj_tweet_parent = new Object();
						obj_tweet_parent['tweet'] = json_obj[t];
						obj_tweet_parent['parent'] = json_obj[t].user;

						array.push(obj_tweet_parent);
						hash_map[hashtags[h].text] = array;
					}
				}
			}
			update_hashtags_container();		
		}
		
	}
	xhr.open("GET", url, true)
	xhr.send();
}

var update_feed_container = function() {
	var feed_container = document.getElementById("tweets_of_users");
	var updated_set_hashtags = {};
	remove_all_children(feed_container);
		
	for(var t in all_tweets) {
		if(checked_users.indexOf(all_tweets[t].user.id_str) > -1) {
			var tweetContainer = buildTweetContainer(all_tweets[t].user, all_tweets[t]);
			feed_container.appendChild(tweetContainer);
			var entities_hashtags = all_tweets[t].entities.hashtags;
			
			for(var entity in entities_hashtags) {
				if(!(updated_set_hashtags[entities_hashtags[entity].text])) {
					updated_set_hashtags[entities_hashtags[entity].text] = 1;
				} else {
					updated_set_hashtags[entities_hashtags[entity].text]++;
				}
			}
		}
	}
	
	set_new_hashtags(updated_set_hashtags);

	if(checked_users.length == 0) {
		update_hashtags_container();
	}
}

var add_user = function(obj) {
	var errors = false;
	var xhr = create_xhr();
	var url = 'index.php?query=feed&screen_name='+obj.screen_name+'&count=20';
	xhr.onreadystatechange = function() {
		if(xhr.readyState == 4 )
                       {
                       loadingOff();
                        if(xhr.status == 200) {
			var json = xhr.responseText;
			var json_obj = JSON.parse(json);
		
			for(var t in json_obj) {
				all_tweets.push(json_obj[t]);
			}
			all_tweets = all_tweets.sort(dateComparator);

			for(var t in json_obj) {
				if(json_obj[t].entit