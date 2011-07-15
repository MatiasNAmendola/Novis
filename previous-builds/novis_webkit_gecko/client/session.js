//Novis Session Controller

System.Session = {
	Username:"",
	Startup:function()
	{
		//Check if user is online
		//if yes, go straight to desktop
		//if no, load login application
		
		
	},
	Login:function(Username,Password,Callback)
	{
		//Send username and password to server
		//check response
	},
	Logout:function()
	{
		//Send logout request
		System.Session.Startup();
	},
	Elevate:function(Username,Password,Callback)
	{
		//send username and password to server
		//check response
	},
	Unelevate:function()
	{
		//send request to server
	}
}
