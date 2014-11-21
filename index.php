<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
require_once('TwitterAPIExchange.php');
require_once('settings.php');
$twitter = new TwitterAPIExchange($settings);
/** Perform a GET request and echo the response **/
/** Note: Set the GET field BEFORE calling buildOauth(); **/
$query = $_GET['query'];
switch($query) {
	case 'lookup' : $url = 'https://api.twitter.com/1.1/users/lookup.json';
					$requestMethod = 'GET';
					$getfield = '?screen_name='.$_GET['screen_name'];
					$twitter->setGetfield($getfield);
					break;
	case 'feed' : $url = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
					$requestMethod = 'GET';
					$screen_name = $_GET['screen_name'];
					$count = isset($_GET['count']) ? $_GET['count'] : 20;
					$getfield = '?screen_name='.$screen_name.'&count='.$count;
					$twitter->setGetfield($getfield);
					break;
}
$api_response =  $twitter->buildOauth($url, $requestMethod)
             ->performRequest();
echo $api_response;