System.Ajax = {
	Post:function(Url,PostObj,Callback)
	{
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange=function()
		{
			if (xmlHttp.readyState==4)
			{
				if (xmlHttp.status==200)
				{
					if (Callback!=undefined && Callback!=null)
					{
						Callback(JSON.parse(xmlHttp.responseText));
					}
				}
				else
				{
					System.Notifications.New(2,"Well something went wrong... Failed to communicate to server!");
					if (Callback!=undefined && Callback!=null)
					{
						Callback(null);
					}
				}
			}
		}
		xmlHttp.open("POST",Url,true);
		xmlHttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		xmlHttp.send("json="+JSON.stringify(PostObj));
	},
	Get:function(Url,Callback)
	{
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange=function()
		{
			if (xmlHttp.readyState==4)
			{
				if (xmlHttp.status==200)
				{
					if (Callback!=undefined && Callback!=null)
					{
						Callback(JSON.parse(xmlHttp.responseText));
					}
				}
				else
				{
					System.Notifications.New(2,"Well something went wrong... Failed to communicate to server!");
					if (Callback!=undefined && Callback!=null)
					{
						Callback(null);
					}
				}
			}
		}
		xmlHttp.open("GET",Url,true);
		xmlHttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		xmlHttp.send(null);
	}
}

System.Menu = {
	MenuDisplay:false,
	SubMenuDisplay:false,
	MenuButtons:{
		//TODO
	},
	SubMenuButtons:{
		//TODO
	},
	ToggleMenu:function(Display)
	{
		if (typeof Display == "boolean")this.MenuDisplay = !Display;
		if (this.MenuDisplay)
		{
			Effects.ResizeElement.Start("Menu-Bar",false,null,0);
		}
		else
		{
			Effects.ResizeElement.Start("Menu-Bar",false,null,43);
		}
		this.MenuDisplay=!this.MenuDisplay;
	},
	ToggleSubMenu:function(Display)
	{
		if (typeof Display == "boolean")this.SubMenuDisplay = !Display;
		if (this.SubMenuDisplay)
		{
			Effects.ResizeElement.Start("Sub-Menu-Bar",false,null,0);
		}
		else
		{
			Effects.ResizeElement.Start("Sub-Menu-Bar",false,null,48);
		}
		this.SubMenuDisplay=!this.SubMenuDisplay;
	},
	CloseMenus:function()
	{
		this.ToggleMenu(false);
		this.ToggleSubMenu(false);
	}
}

System.Session = {
	Startup:function()
	{
		this.LoggedIn(function(Obj){
			if (Obj != null && typeof Obj.error != "false")
			{
				if (Obj.data["logged-in"] == "true")
				{
					System.Session.PrepDesk();
				}
				else
				{
					System.Session.DisplayLogin();
				}
			}
		});
	},
	UILogin:function()
	{
		var user = document.getElementById('Login-Username');
		var pass = document.getElementById('Login-Password');
		if (user!=null&&pass!=null)
		this.DoLogin(user.value,pass.value);
	},
	DoLogin:function(Username,Password)
	{
		System.Ajax.Post("system/login.php?action=login",{username:escape(Username),password:escape(Password)},function(Obj)
		{
			if (Obj != null && typeof Obj.error != "false")
			{
				if (Obj.data["login-status"]=="true")
				{
					System.Session.PrepDesk();
					System.Notifications.New(1,"Login successful!");
				}
				else
				{
					System.Notifications.New(2,"Login failed! Please check your username and password!");
				}
			}
		});
	},
	DoLogout:function()
	{
		System.Ajax.Get("system/login.php?action=logout",function(Obj)
		{
			if (Obj != null && typeof Obj.error != "false")
			{
				if (Obj.data["logout-status"]=="true")
				{
					//todo: close apps etc
					System.Menu.CloseMenus();
					System.Session.DisplayLogin();
					document.getElementById("Bottom-Bar-Button-Logout").style.display = "none";
					System.Notifications.New(1,"Logout successful!");
				}
			}
		});
	},
	PrepDesk:function()
	{
		System.Session.HideLogin();
		System.Menu.ToggleMenu(true);
		document.getElementById("Bottom-Bar-Button-Logout").style.display = "";
	},
	LoggedIn:function(Callback)
	{
		System.Ajax.Get("system/login.php?action=status",Callback);
	},
	DisplayLogin:function()
	{
		document.getElementById("Login-Screen").style.display="block";
	},
	HideLogin:function()
	{
		Effects.FadeElement.Start("Login-Screen",0,function(){document.getElementById("Login-Screen").style.display="none";document.getElementById("Login-Screen").style.opacity=1;});
	}
}

System.Notifications = {
	Level:0, //0 = All Notifications, 1 = Success and Error Notifications, 2 = Error Notifications, 3 = No Notifications
	Timeout:null,
	New:function(Type,Text)
	{
		if (this.Timeout!=null)
		clearTimeout(this.Timeout);
		var col;
		switch (Type)
		{
			case 1:
				if (this.Level>=2)return false;
				col = "#CCFFCC";
				Text = "<img style='width:22px;height:22px;vertical-align:middle;' src='client/icons/button_white_check.png' /><span style='position:relative;top:2px;left:4px;'>"+Text+"</span>";
			break;
			case 2:
				if (this.Level>=3)return false;
				col = "#EEAAAA";
				Text = "<img style='width:22px;height:22px;vertical-align:middle;' src='client/icons/button_white_stop.png' /><span style='position:relative;top:2px;left:4px;'>"+Text+"</span>";
			break;
			default:
				if (this.Level>=1)return false;
				col = "#C5ECF1";
				Text = "<img style='width:22px;height:22px;vertical-align:middle;' src='client/icons/button_white_info.png' /><span style='position:relative;top:2px;left:4px;'>"+Text+"</span>";
			break;
		}
		document.getElementById("Notification-Bar").innerHTML = Text;
		document.getElementById("Notification-Bar").style.display="";
		Effects.ResizeElement.Start("Notification-Bar",false,null,22,function()
		{
			System.Notifications.Timeout = setTimeout(function(){System.Notifications.HideNotification();},5000);
		});
		Effects.ColourFadeElement.Start("Notification-Bar",document.getElementById("Notification-Bar").style.backgroundColor,col,function(col){document.getElementById("Notification-Bar").style.backgroundColor = col;});
		return true;
	},
	HideNotification:function()
	{
		Effects.ResizeElement.Start("Notification-Bar",false,null,0,function(){document.getElementById("Notification-Bar").style.backgroundColor="#FFFFFF";document.getElementById("Notification-Bar").style.display="none";});
	}
}

System.LoadNext();
