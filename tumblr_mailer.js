var fs = require("fs");
var ejs = require("ejs");
var tumblr = require("tumblr.js")
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('HQlvcLaH5DIqs1m0H4tx2w');

var csvFile = fs.readFileSync("friend_list.csv", "utf8");
var emailTemplate = fs.readFileSync("email_template.ejs", "utf8");
var arrayOfContacts = csvParse(csvFile);
var client = tumblr.createClient({
  consumer_key: 'NldVzswVkrKCYXIrFz9pKiM7ukllM2E9fazmWolEiZGOiU3NBl',
  consumer_secret: 'JWwMiaaMyenTdvQyTWTUF3TRmdsrROWhHbyoH9BRN5HIaA3FTI',
  token: 'lDo970LpY6UNdUYZDyYVRLHKKb4eJWkvmiJEfPkV93DTPY2qin',
  token_secret: 'YMCdAFdaXiENx8PI1RZrS1U6gV7gwHbdA0R8i3QZO99Cduwvq9'
});


//Create a function to parse the file into Objects then push them into an array.
function csvParse(csvFile) {
	var arrayLines = csvFile.split("\n").slice(1, -1);
	var resArray = [];

	for(var i = 0; i < arrayLines.length; i++){
		var arrayWords = arrayLines[i].split(",");
		var contactObj = {
			firstName: arrayWords[0],
			lastName : arrayWords[1],
			numMonthsSinceContact: arrayWords[2],
			emailAddress: arrayWords[3]
		}
		resArray.push(contactObj);
	}
	return resArray;
}

//A function to create and send emails:
function createEmails(error, blog){
	var postsArray = blog.posts;
	var latestPosts = [];
	var emails = [];

	for(var i in postsArray){
		//To keep my life easy I found how many milliseconds are there in a week
		//Then I push all the blogs articles created between now and a week ago in an empty array "latestPosts"
		if(Date.now() - Date.parse(postsArray[i].date) <= 604800000) {
			latestPosts.push({
				href: postsArray[i].post_url,
				title: postsArray[i].title
			});
		}
		//I break the loop cause the posts are in chronological order so for sure the ones after are more than a week old.
		break;
	}

	//I add the property latestPosts in every contact Object in the ArrayOfContacts, then send them the email. 
	for(var i in arrayOfContacts){
		arrayOfContacts[i].latestPosts = latestPosts;
		var renderedEmail = ejs.render(emailTemplate, arrayOfContacts[i]);
		sendEmail(arrayOfContacts[i].firstName, arrayOfContacts[i].emailAddress, "Massimo", "massimo.crapanzano@gmail.com", "Check my blog", renderedEmail);
	}
}


function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,    
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]    
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
        // console.log(message);
        // console.log(result);   
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
 }



client.posts('massimoatfullstack.tumblr.com', createEmails);






