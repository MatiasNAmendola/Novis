System.Applications = {
	Apps:new Array(),
	GetNewId:function()
	{
		var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);}).toUpperCase();
		return (typeof this.Apps[id] == "undefined" ? id : this.GetNewId());
	},
	NewApplication:function(Code)
	{
		var newApp = new Worker("application.js?"+Effects.GetNewId());
		newApp.onmessage = this.MessageBinding;
		newApp.onerror = this.MessageBinding;
		this.App2Worker[this.GetNewId()] = newApp;
	},
	ErrorBinding:function(Event)
	{
		//todo better
		System.Notifications.New(2,"Error in Worker/App: "+Event.message+" ("+Event.filename+", "+Event.lineno+")");
	},
	MessageBinding:function(Event)
	{
		
	}
}

System.API = {
	Test:function(AppId,Data)
	{
	}
}


System.LoadNext();
