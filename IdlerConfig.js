    var steamClientFactory = require('./steamClient.js');
    var configsArray = [];
    var config;
    var botArray = [];
    
    config = {};
    config.username = 'username';
    config.password = 'pass';
    config.sharedSecret = ''; //Shared Secret(for 2FA only) https://github.com/Jessecar96/SteamDesktopAuthenticator/releases
    config.games = ["custom game",games,] //replace "games" with the game id seperated by ,
   configsArray.push(config);
	

	
    console.log('Number of configurations set up: ' + configsArray.length);
     
    for	(index = 0; index < configsArray.length; index++) {
    	var config = configsArray[index];
		
		var bot = steamClientFactory.buildBot(config);
		bot.doLogin();
		botArray.push(bot);
    }
     
    console.log('Running ' + botArray.length + ' bots.');
