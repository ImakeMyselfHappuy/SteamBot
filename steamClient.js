var SteamUser = require('steam-user');
var SteamTotp = require('steam-totp');
var botFactory = {};
 
botFactory.buildBot = function (config)
{	
	var bot = new SteamUser({
        promptSteamGuardCode: false,
		dataDirectory: "./sentry",
		singleSentryfile: false
    });
	
	bot.username = config.username;
	bot.password = config.password;
	bot.sharedSecret = config.sharedSecret;
	bot.games = config.games;
	bot.messageReceived = {};
	
	bot.on('loggedOn', function(details) {
		console.log("[" + this.username + "] Logged into Steam as " + bot.steamID.getSteam3RenderedID());
		bot.setPersona(SteamUser.EPersonaState.Online);
		bot.gamesPlayed(this.games);
	});
	
	bot.on('error', function(e) {
		console.log("[" + this.username + "] " + e);
		setTimeout(function() {bot.doLogin();}, 30*60*1000);
	});
 
	bot.doLogin = function ()
	{
		this.logOn({ 
			"accountName": this.username,
			"password": this.password
		});
	}
	
	bot.on('steamGuard', function(domain, callback) {
		if ( !this.sharedSecret ) {
			var readlineSync = require('readline-sync');
			var authCode = readlineSync.question("[" + this.username + "] " + 'Steam Guard' + (!domain ? ' App' : '') + ' Code: ');
			callback(authCode);	
		} 
		else {
			var authCode = SteamTotp.generateAuthCode( this.sharedSecret );
			console.log("[" + this.username + "] Generated Auth Code: " + authCode);
			callback(authCode);	
		}
		
	});

	
	bot.on('vacBans', function(numBans, appids) {
		if(numBans > 0) {
			console.log( "[" + this.username + "] " + numBans + " VAC ban" + (numBans == 1 ? '' : 's') + "." + 
						(appids.length == 0 ? '' : " In apps: " + appids.join(', ')) );
		}
	});
 
bot.on('friendsList', function() {
    for (var sid in bot.myFriends);
        var relationship = bot.myFriends[sid]
        if (relationship == SteamUser.EFriendRelationship.RequestRecipient) {
        console.log("(offline) We recieved a friend request from "+sid);
        bot.addFriend(sid, function (err, name) {
            if (err) {
                console.log(err);
                return;
            }
            console.log("(offline) Accepted user with the name of "+name)
        })
    }
})
 

bot.on('friendRelationship', function(sid, relationship) {
    if (relationship == SteamUser.EFriendRelationship.RequestRecipient) {
        console.log("We recieved a friend request from "+sid);
        bot.addFriend(sid, function (err, name) {
            if (err) {
                console.log(err);
                return;
            }
            console.log("Accepted user with the name of "+name)
        })
    }
 
})
 
bot.on('groupRelationship', function(sid, relationship) {
    if (relationship == SteamUser.EClanRelationship.Invited) {
        console.log("We were asked to join steam group #"+sid);
        bot.respondToGroupInvite(sid, true);
    }
})


bot.on('groupList', function() {
    for (var sid in bot.myGroups);
        var relationship = bot.myGroups[sid];
        if (relationship == SteamUser.EClanRelationship.Invited) {
        console.log("(offline) We were asked to join steam group #"+sid);
        bot.respondToGroupInvite(sid, true);
    }
})

	
	bot.on('accountLimitations', function(limited, communityBanned, locked, canInviteFriends) {
		var limitations = [];
 
		if(limited) {
			limitations.push('LIMITED');
		}
 
		if(communityBanned) {
			limitations.push('COMMUNITY BANNED');
		}
 
		if(locked) {
			limitations.push('LOCKED');
		}
 
		if(limitations.length !== 0) {
			console.log("[" + this.username + "] Limitations: " + limitations.join(', ') + ".");
		}
	});
	
	return bot;
}
 
module.exports = botFactory;