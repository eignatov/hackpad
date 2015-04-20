/**
 * @author - Jake Liscom 
 * @project - OpenNote
 */

//Module Declaration
var openNote = angular.module("openNote", [	"ngRoute",
                                           	"ngResource", 
                                           	"ngSanitize", 
                                           	"ngAnimate", 
                                           	"ui.tree"]);

/**
 * Used to redirect users to login if their token has expired
 * Runs on every route
 */
openNote.run(function (	$rootScope, 
						$location, 
						userService, 
						config, 
						serverConfigService, 
						storageService,
						$http){
	
	$rootScope.helpContent=config.getHelpContent();
	
    $rootScope.$on("$routeChangeStart", function (event) {    	
    	//server config values
    		serverConfigService.getConfig().then(function(config){
    			if(!config)
    				alertify.error("Connection to service failed");
    			else
    				$rootScope.serverConfig=config;
    		}); //attach server config to root scope
    		
    	//Initial entry after if logged in 
        	if(!$rootScope.showMenu && !$rootScope.showSideBar)//make sure we only fade in/run once
        		$rootScope.$emit("init");
    });
    
    
    /**
     * Initialize app and start fade in
     */
    $rootScope.$on("init",function(){
    	userService.useAPITokenHeader();//use token
    	    	
    	$rootScope.showMenu=true;
    	$rootScope.showSideBar=true;
    	
    	//options for humans
        	$rootScope.showHelpButton = config.showHelpButton();
        	$rootScope.showLogOutButton = config.showLogOutButton();
        	
        	/**
        	 * Log out function
        	 */
        	$rootScope.logOut = function(){
        		$rootScope.$emit("logOut");
        	};		        	
        
    	//Check for updates
        	$http.get(config.getUpdateURL()).then(
    			function(response){//Successful
    				if(response.data.version!=config.getVersion())
    					alertify.log("<a href='"+response.data.updateURL+"' target='_blank'>"+response.data.updateText+"</a>", "", 0);
    			}
			);
    	});
    
    /**
     * Handle logOut event
     */
    $rootScope.$on("logOut",function(){//FIXME
		storageService.destroyDatabase(function(){
			userService.destroyTokenHeader();
			$rootScope.$emit("reloadListView", {});
			window.location.href='#/';
			$rootScope.$apply();
		});
    });
});