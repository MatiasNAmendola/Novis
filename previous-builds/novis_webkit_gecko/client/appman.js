//Novis Application Manager

System.Apps = {
	Apps:new Array(),
	NewFromText:function(Text,Arguments)
	{
		try
		{
			var id = System.Apps.Apps.length;
			var info = System.Parse.ConfigFile(Text,true);
			var codebase = Text.slice(Text.indexOf("Code::")+6);
			eval("System.Apps.Apps["+id+"]="+codebase);
			System.Apps.Apps[id].Arguments = Arguments;
			System.Apps.Apps[id].Info = info;
			System.Apps.Apps[id].Id = id;
			System.Apps.Apps[id].Events={
				Events:new Array(),
				Attach:function(Handle,Name,Function)
				{
					var eid = System.Apps.Apps[id].Events.Events.push({Handle:Handle,Name:Name,Function:Function})-1;
					System.Events.Attach(Handle,Name,Function);
					return eid;
				},
				Dettach:function(EventId)
				{
					if (System.Misc.IsInbetween(EventId,0,System.Apps.Apps[id].Events.Events.length))
					{
						var e = System.Apps.Apps[id].Events.Events[EventId];
						if (typeof e != 'undefined')
						{
							System.Events.Dettach(e.Handle,e.Name,e.Function);
							delete System.Apps.Apps[id].Events.Events[EventId];
							return true;
						}
					}
					return false;
				},
				DettachAll:function()
				{
					var eventObj = System.Apps.Apps[id].Events;
					var e;
					for (var i = 0; i < eventObj.Events.length; i++)
					{
						e=eventObj.Events.pop();
						if (typeof e != 'undefined')
						System.Events.Dettach(e.Handle,e.Name,e.Function);
					}
				}
			}
			System.Apps.Apps[id].OnLaunch();
			return id;
		}
		catch(e)
		{
			//Will replace alert with messaging service
			alert("Novis Application Error!\n\n"+e.message+"\n");
			System.Applications.Kill(id);
			return false;
		}
	},
	NewFromFile:function(File,Arguments)
	{
		//Might integrate into localstorage
		//GET FILE
		//OVERLOAD TO ABOVE
	},
	Close:function(AppId)
	{
		if (typeof System.Apps.Apps[AppId].OnClose == 'function' && System.Apps.Apps[AppId].OnClose()==true)
		{
			System.Apps.Kill(AppId);
		}
	},
	Kill:function(AppId)
	{
		System.Apps.Apps[AppId].Events.DettachAll();
		delete System.Apps.Apps[AppId];
		System.Controls.Windows.KillAll(AppId);
	}
}
