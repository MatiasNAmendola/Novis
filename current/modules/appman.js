var AppMan = {
	Applications:new Array(),
	StartApplication:function(Url)
	{
		var app = new Application(this.Applications.length,Url);
		app.AddControlledErrorListener(this.OnApplicationError);
		this.Applications.push(app);
	}
	Terminate:function(Id)
	{
		if (this.Applications[Id] != null || typeof this.Applications[Id] != "undefined")
		{
			this.Applications[Id].Terminate();
			this.Applications[Id] = null;
		}
	}
	OnApplicationError:function(Id,Event)
	{
		console.warn("Application Error - ID: "+Id+" - Message: "+Event.data);
		this.Terminate(Id);
	}
}

function Application(Id,Url,Args)
{
	this.Url = Url;
	this.Id = Id;
	this.Sandbox = new Worker("modules/sandbox.js?id="+Id+"&url="+escape(Url));
	this.Args = Args;
	this.Send = function(Message)
	{
		this.Sandbox.postMessage(Message);
	}
	this.Terminate = function()
	{
		this.Sandbox.terminate();
		this.Sandbox = null;
	}
	this.IsRunning = function() { return (this.Sandbox==null); }
	this.AddMessageListener = function(Function)
	{
		this.Sanbox.addEventListener('message',Function);
	}
	this.AddErrorListener = function(Function)
	{
		this.Sanbox.addEventListener('error',Function);
	}
	//Controlled Listeners
	this.ControlledErrorListeners = new Array();
	this.ControlledMessageListeners = new Array();
	this.AddControlledErrorListener = function(Function)
	{
		this.ControlledErrorListeners.push(Function);
	}
	this.AddControlledMessageListener = function(Function)
	{
		this.ControlledMessageListeners.push(Function);
	}
	this.OnControlledError = function(Event)
	{
		this.OnControlled(this.ControlledErrorListeners,Event);
	}
	this.OnControlledMessage = function(Event)
	{
		this.OnControlled(this.ControlledMessageListeners,Event);
	}
	this.OnControlled = function(ControlledList,Event)
	{
		for (var i = 0; i < this.ControlledList.length; i++)
		{
			if (typeof this.ControlledList[i] == "function")
				this.ControlledList[i](this.Id,Event);
		}
	}
	this.AddErrorListener(this.OnControlledError);
	this.AddErrorListener(this.OnControlledMessage);
	//Startup
	this.Send(this.Args);
}

Startup();