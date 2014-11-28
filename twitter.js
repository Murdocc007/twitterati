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
        insert_tag(hashtag);
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

var insert_user=function(name){

    if(document.location.search=="")
    {
        var query="?users=";
        query=query+name+"%20D;%20C";
        history.pushState('','Twitterati',query);
}
    else{
        var end=location.search.indexOf(';');
        var prefix=location.search.substr(0,end);
        var suffix=location.search.substr(end+1,location.search.length);
        prefix=prefix+name+"%20D;";
        var temp_str=prefix+suffix;
        history.pushState('','Twitterati',temp_str);
    }
    
}

var insert_tag=function(tag){


    var start=location.search.indexOf('%20C');
    var prefix=location.search.substr(0,start+4);
    var temp_str=prefix+"tag="+tag;
    history.pushState('','Twitterati',temp_str);

    
}

var insert_checked_user=function(){
var start=location.search.indexOf(';')
var prefix=location.search.substr(0,start+1);
var temp_str="checked_users=";
for(var i=0;i<checked_users.length;i++)
{
    temp_str=temp_str+checked_users[i]+"%20D";
}
    history.pushState('','Twitterati',prefix+temp_str+"%20C");
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
            var ul= document.getElementById("list_of_users");
            var li = document.createElement('li');
            li.setAttribute('style','padding:4px;border-bottom:1px solid;')
            var diva = document.createElement('div');
            diva.setAttribute('style','display:inline;')
            img=document.createElement("img");
            img.setAttribute('src', obj.profile_image_url);
            diva.appendChild(img);

            var label = document.createElement('label')
            label.htmlFor = obj.id;
            label.appendChild(document.createTextNode(obj.name));
            diva.appendChild(label);


            var divb = document.createElement('div');
            divb.setAttribute('style','display:inline;margin-left:5px;');
            var checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.setAttribute('id',obj.id_str);


             var divc=document.createElement('div');
             divc.setAttribute('style','width:135px;word-wrap:break-word;overflow:auto;')
             divc.appendChild(document.createTextNode(obj.description));

            checkbox.addEventListener('click', function() {
                if(this.checked) {
                    checked_users.push(obj.id_str);
                    insert_checked_user();
                } else {
                    var index = checked_users.indexOf(obj.id_str);
                    if(index > -1) {
                        checked_users.splice(index, 1);
                    }
                    insert_checked_user();
                }
                update_feed_container();
            });


            divb.appendChild(checkbox);
            li.appendChild(diva);
            li.appendChild(divb);
            li.appendChild(divc);
            ul.appendChild(li);
                }
               else {
  alert("Unable to fetch User's tweets");
}
}

            }
            xhr.open("GET", url, true)
            xhr.send();
            loadingOn();
	
}

var user_lookup = function(screen_name) {
	var errors = false;
	var xhr = create_xhr();
	var url = 'index.php?query=lookup&screen_name='+screen_name;
	xhr.onreadystatechange = function() {
		if(xhr.readyState == 4) {
			var json = xhr.responseText;
			var json_obj = JSON.parse(json);
			for(var key in json_obj)
			{
				if(key=='errors') {
					errors = true;
					break;
				}
			}
			if(errors)
			{
				alert("User with screen name "+screen_name+" does not exist");
			} else {
				add_user(json_obj[0]);
                insert_user(json_obj[0].screen_name);
                 }
		}
	}
	xhr.open("GET", url, true);
	xhr.send();
}

var check_user = function() {
	var name = document.getElementById("twit_screen_name").value;
        for(var i=0;i<all_users.length;i++)
         {
          if(all_users[i]==name)
            {
              alert("User Already Exists!");
              return;
            }
        }
	if(name!="")
	{
        if(all_users.length==0)
        {
        usersdiv=document.getElementById("list_of_users");
        usersdiv.style.display="block";
        }
                all_users[all_users.length++]=name;
		user_lookup(name);
	}
        else{
         alert("You haven't entered a username!")
       }
}

var comparator=function(a,b){

var t1=a.indices[0];
var t2=b.indices[0];
    
    if(t1 > t2) return 1;
	else if(t1 == t2) return 0;
	else return -1;

}
var buildTweetContainer = function(userObj, tweetObj) {
	var outerdiv = document.createElement('row');
	outerdiv.setAttribute('class', 'tweetcontainer');
	outerdiv.setAttribute('rel', userObj.id_str);

	var prof_img = document.createElement('img');
	prof_img.setAttribute('src', userObj.profile_image_url);
	
	var tweetname = document.createElement('div');
	tweetname.setAttribute('class', 'tweetname');
	tweetname.appendChild(document.createTextNode(userObj.name));

	var tweetbody = document.createElement('div');
	tweetbody.setAttribute('class', 'tweetbody');
	tweetbody.setAttribute('id', tweetObj.id_str);
    
    var tweet= tweetObj.text;

    var indices_array=tweetObj.entities.hashtags;
    indices_array=indices_array.sort(comparator);
    for(var i=(indices_array.length)-1;i>=0;i--)
    {
    var prefix=tweet.substring(0,indices_array[i].indices[0]);
    var hashtag=tweet.substring(indices_array[i].indices[0],indices_array[i].indices[1]);
    hashtag="<a href='#'  onclick=update_feed_with_hashtweets('"+indices_array[i].text+"')>#"+indices_array[i].text+"</a>"
    var postfix=tweet.substring(indices_array[i].indices[1],tweet.length); 
    tweet=prefix+hashtag+postfix;

    }
    var temp=document.createElement("div");
    temp.innerHTML=tweet;
    tweetbody.appendChild(temp);
    
	var timestamp = document.createElement('div');
	timestamp.setAttribute('class', 'timestamp');
	timestamp.appendChild(document.createTextNode(tweetObj.created_at))
	timestamp.setAttribute('style','padding-bottom:10px;');
    
	outerdiv.appendChild(prof_img);
	outerdiv.appendChild(tweetname);
	outerdiv.appendChild(tweetbody);
	outerdiv.appendChild(timestamp);

    
	return outerdiv;
}
	
var loadingOn=function() {
    var loader=document.getElementById('loader');
    loader.style.display='block';
}

var loadingOff=function() {
    var loader=document.getElementById('loader');
    loader.style.display='none';
}

var getusers=function(userarray,count,tag){
    if(count>=0)
    {
    var errors = false;
	var xhr = create_xhr();
	var url = 'index.php?query=lookup&screen_name='+userarray[count];
	xhr.onreadystatechange = function() {
		if(xhr.readyState == 4) {
			var json = xhr.responseText;
			var json_obj = JSON.parse(json);
				add_user1(json_obj[0],count,userarray,tag);
                 }
		}
	xhr.open("GET", url, true);
	xhr.send(); 
}
}


var add_user1 = function(obj,count,userarray,tag) {	
    var errors = false;
	var xhr = create_xhr();
	var url = 'index.php?query=feed&screen_name='+obj.screen_name+'&count=20';
	xhr.onreadystatechange = function() {
		if(xhr.readyState == 4 )
                       {
            if(xhr.status == 200) {
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
            var ul= document.getElementById("list_of_users");
            var li = document.createElement('li');
            li.setAttribute('style','padding:4px;border-bottom:1px solid;')
            var diva = document.createElement('div');
            diva.setAttribute('style','display:inline;')
            img=document.createElement("img");
            img.setAttribute('src', obj.profile_image_url);
            diva.appendChild(img);

            var label = document.createElement('label')
            label.htmlFor = obj.id;
            label.appendChild(document.createTextNode(obj.name));
            diva.appendChild(label);


            var divb = document.createElement('div');
            divb.setAttribute('style','display:inline;margin-left:5px;');
            var checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.setAttribute('id',obj.id_str);


             var divc=document.createElement('div');
             divc.setAttribute('style','width:135px;word-wrap:break-word;overflow:auto;')
             divc.appendChild(document.createTextNode(obj.description));

            checkbox.addEventListener('click', function() {
                if(this.checked) {
                    checked_users.push(obj.id_str);
                    insert_checked_user();
                } else {
                    var index = checked_users.indexOf(obj.id_str);
                    if(index > -1) {
                        checked_users.splice(index, 1);
                    }
                    insert_checked_user();
                }
                update_feed_container();
            });


            divb.appendChild(checkbox);
            li.appendChild(diva);
            li.appendChild(divb);
            li.appendChild(divc);
            ul.appendChild(li);
            if(count>0)
            {
                getusers(userarray,count-1,tag);
            }
            else{
              loadingOff();
            for(var i=0;i<checked_users.length;i++)
            {
                document.getElementById(checked_users[i]).checked=true;
            }
                update_feed_container();
                   if(tag){
                update_feed_with_hashtweets(tag);
                     }
                   }
                }
               else {
  alert("Unable to fetch User's tweets");
}
}

            }
            xhr.open("GET", url, true)
            xhr.send();
           
}


window.onload=function(){
if(location.search!="")
{
loadingOn();
var users=[];
var tag=null;
var items=location.search.substr(location.search.indexOf('users')+6,location.search.indexOf(';')-location.search.indexOf('=')).split("%20D");
for(var i=0;i<items.length-1;i++)
{
 users[i]=items[i];   
}
if(location.search.indexOf('checked_users')!=-1)
{    
items=location.search.substr(location.search.indexOf('checked_users')+'checked_users'.length+1,
location.search.indexOf('%20C')-location.search.indexOf('checked_users')-'checked_users'.length-1).split("%20D");  
for(var i=0;i<items.length-1;i++)
{
 checked_users[i]=items[i];   
}
}
if(location.search.indexOf('tag')!=-1)
{
items=location.search.substr(location.search.indexOf('tag')+'tag'.length+1).split("%20D");          
tag=items[0];
}
items=null;
var div=document.getElementById('list_of_users');
div.style.display='block';
getusers(users,users.length-1,tag);
}
}

	