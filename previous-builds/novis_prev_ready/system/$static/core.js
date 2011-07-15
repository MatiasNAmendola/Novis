//Novis JavaScript Core
//Created by James Turner

//Possible Features
//-Application Caching
//-Directory Caching
//-Server Request Caching
var Core = {
	Firebug:function(Text)
	{
		if (window._firebug==null){setTimeout("Core.Firebug('"+Text+"');",100); return null;}
		window._firebug.notifyFirebug(Array("Novis Message - ",Text),"info","firebugAppendConsole");
		return true;
	},
	Cleanup:function()
	{
		Core.Sound.Cleanup();
		Core.Applications.Cleanup();
	},
	Paths:{
		System:'system',
		Themes:'system/themes',
		Users:'system/users',
		Config:'system/$configuration',
		Static:'system/$static',
	},
	Version:"",
	Statistics:{
		TotalCalls:0,
		TotalWindowsOpened:0,
		TotalEffects:0,
		TotalBrowserResizes:0,
		TotalApplicationErrors:0,
		TotalErrors:0,
		TotalMessageBoxes:0,
	},
	Workers:{
		Time:{
			CurrentTime:0,
			Thread:new Worker("index.php?action=fs-get&encode=false&type=static&path=time.worker.js"),
			OnMessage:function(event)
			{
				Core.Workers.Time.CurrentTime = event.data;
				document.getElementById("Novis-Time").innerHTML=Core.Workers.Time.CurrentTime;
			},
			OnError:function(event)
			{
				Core.MessageBox.ShowMessage("index.php?action=fs-get&type=themes&path=default/32/status/dialog-error.png","Time Thread Error! "+event.message,true,"error");
			},
			Message:function(object)
			{
				Core.Workers.Time.Thread.postMessage(object);
			},
		},
	},
	ServerCall:{
		CallCount:0,
		SendRequest:function(URL,PostData,ReturnTo)
		{
			var xmlHttp = new XMLHttpRequest();
			Core.ServerCall.CallCount++;
			document.getElementById("Ajax").style.display="block";
			document.getElementById("Ajax").title="Sending Request...";
			Core.Statistics.TotalCalls++;
			xmlHttp.onreadystatechange=function()
			{
				if (xmlHttp.readyState==2)
				{
					document.getElementById("Ajax").title="Waiting for reply...";
				}
				else if (xmlHttp.readyState==3)
				{
					document.getElementById("Ajax").title="Processing...";
				}
				else if (xmlHttp.readyState==4)
				{
					document.getElementById("Ajax").title="Complete!";
					Core.ServerCall.CallCount--;
					if (Core.ServerCall.CallCount==0){document.getElementById("Ajax").style.display="none";}
					if (xmlHttp.status==200)
					{
						Core.Workers.Time.Message(xmlHttp.getResponseHeader("Server-Time"));
						//May Re-add code
						//if (xmlHttp.getResponseHeader("Novis-Version")>Core.Version){if (confirm("Note: The Server is running an updated version of Novis. To insure full compatibility, you must reset your session. Do you want to reset now? All unsaved data will be lost!")){location.href=location.href;}}
						if (ReturnTo!=undefined && ReturnTo!=null)
						{
							ReturnTo(unescape(xmlHttp.responseText));
						}
					}
					else
					{
						Core.MessageBox.ShowMessage("index.php?action=fs-get&type=themes&path=default/32/status/dialog-error.png","AJAX Error! Code "+xmlHttp.status+" while trying to communicate to "+URL,true,"error");
						if (ReturnTo!=undefined && ReturnTo!=null)
						{
							ReturnTo(null);
						}
					}
				}
			}
			xmlHttp.open("POST",URL,true);
			xmlHttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
			xmlHttp.send(PostData);
		},
	},
	Menu:{
		Position:0, //0 = Up | 1 = Moving Up | 2 = Moving Down | 3 = Down
		Items:new Array(),
		NextItemId:0,
		ItemCount:0,
		Effects:{
			MovingInt:null,
			MovingTimeout:null,
			UpTimeout:100,
			DownTimeout:350,
			MouseOver:function()
			{
				if (Core.Menu.Position<=1)
				{
					clearInterval(Core.Menu.Effects.MovingInt);
					clearTimeout(Core.Menu.Effects.MovingTimeout);
					Core.Menu.Position=2;
					Core.Effects.Fade("Menu",80,10);
					Core.Menu.Effects.MovingTimeout=setTimeout('Core.Menu.Effects.MovingInt=setInterval("Core.Menu.Effects.MouseOver();",10);',Core.Menu.Effects.DownTimeout);
				}
				else
				{
					var menu = document.getElementById("Menu");
					if (parseInt(menu.style.height)<48)
					{
						menu.style.height=parseInt(menu.style.height)+6+"px";
					}
					else
					{
						Core.Menu.Position=3;
						clearInterval(Core.Menu.Effects.MovingInt);
					}
				}
			},
			MouseOut:function()
			{
				if (Core.Menu.Position>=2)
				{
					clearInterval(Core.Menu.Effects.MovingInt);
					clearTimeout(Core.Menu.Effects.MovingTimeout);
					Core.Menu.Position=1;
					Core.Effects.Fade("Menu",60,10);
					Core.Menu.Effects.MovingTimeout=setTimeout('Core.Menu.Effects.MovingInt=setInterval("Core.Menu.Effects.MouseOut();",10);',Core.Menu.Effects.UpTimeout);
				}
				else
				{
					var menu = document.getElementById("Menu");
					if (parseInt(menu.style.height)>24)
					{
						menu.style.height=parseInt(menu.style.height)-6+"px";
					}
					else
					{
						Core.Menu.Position=0;
						clearInterval(Core.Menu.Effects.MovingInt);
					}
				}
			},
		},
		AddItem:function(Id,ImagePath)
		{
			if (Core.Menu.Items[Id]){return false;}
			Core.Menu.Items[Id]=true;
			var obj = document.getElementById("Menu");
			
			var CurrentCol = Core.Menu.ItemCount;
			
			var Item = document.createElement("img");
			Item.id = "Window-"+Id+"-Menu-Item";
			Item.src = ImagePath;
			Item.style.left = 22*CurrentCol+"px";
			Item.style.top = 1+"px";
			Item.style.width = 22+"px";
			Item.style.height = 22+"px";
			Item.style.position="absolute";
			Item.style.opacity=0;
			Item.onclick = function() {if(Core.Applications.Windows[Id]["Minimised"]){Core.Applications.MinimiseWindow(Id);}Core.Applications.Focus(Id);}
			Item.ondblclick = function() {if (confirm("Close Window?")){Core.Applications.CloseWindow(Id);}}
			Item.onmouseover = function() {if (document.getElementById("Window-"+Id)!=null){document.getElementById("WinDescription").innerHTML=Core.API.Windows.Title(Id)+" - "+Core.Applications.Applications[Core.Applications.Windows[Id]["ParentApp"]].Description; Core.Effects.HideWindows(20,Id);}}
			Item.onmouseout = function() {document.getElementById("WinDescription").innerHTML=""; Core.Effects.ShowWindows();}
			
			obj.appendChild(Item);
			Core.Effects.Fade("Window-"+Id+"-Menu-Item",100,20);
			Core.Menu.ItemCount++;
			return true;
		},
		DeleteItem:function(Id)
		{
			if (Core.Menu.Items[Id]==true)
			{
				Core.Menu.ItemCount--;
				Core.Effects.Fade("Window-"+Id+"-Menu-Item",0,10,'document.getElementById("Menu").removeChild(document.getElementById("Window-"+'+Id+'+"-Menu-Item")); delete Core.Menu.Items['+Id+'];  Core.Menu.AdjustPosition();');
				return true;
			}
			return false;
		},
		AdjustPosition:function()
		{
			var CurrentCol = 0;
			for (var i = 0; i < Core.Menu.Items.length; i++)
			{
				var obj = document.getElementById("Window-"+i+"-Menu-Item");
				if (Core.Menu.Items[i] && obj!=null)
				{
					obj.style.left=22*CurrentCol+"px";
					CurrentCol++;
				}
			}
		},
		ChangeItemImage:function(Id,ImagePath)
		{
			if (Core.Menu.Items[Id]==true)
			{
				Core.Effects.Fade("Window-"+Id+"-Menu-Item",0,5,'document.getElementById("Window-"+'+Id+'+"-Menu-Item").src="'+ImagePath+'"; Core.Effects.Fade("Window-"+'+Id+'+"-Menu-Item",100,5);');
				return true;
			}
			return false;
		},
	},
	Menus:{
		CreateMenu:function(ElementId,X,Y,Width,Chunks)
		{
			//Name - Title - Function Name
			var chunks = Core.Parse.BreakApartChunks(Chunks);
			var code = '<div id="'+ElementId+'" style="position:absolute; left:'+X+'px; top:'+Y+'px; width:'+Width+'px;>';
			for (var i = 0; i < chunks.length; i++)
			{
				code+='<div style="text-align:center;" id="'+ElementId+'-Item-'+i+'" onclick="'+chunks[i][2]+'">'
				'<div style="text-align:center;" id="ContextMenu-Item-2" onclick="Core.Desktop.Refresh(); Core.Desktop.ContextMenu();" onmouseover="this.className=\'Button-Highlight\'" onmouseout="this.className=\'Button\'">Refresh</div><div style="text-align:center;" id="ContextMenu-Item-3" onclick="Core.Panel.Move(1); Core.Panel.Controls.About(); Core.Desktop.ContextMenu();" onmouseover="this.className=\'Button-Highlight\'" onmouseout="this.className=\'Button\'">About Novis</div>'
			}
			document.getElementById("Menus").innerHTML+=code+"</div>";
		},
		DestroyMenu:function(ElementId)
		{
			document.getElementById("Menus").removeChild(document.getElementById(ElementId));
		},
	},
	Effects:{
		Faders:new Array(),
		ColourFaders:new Array(),
		Resizers:new Array(),
		Fade:function(ElementId,Opacity,Interval,ExecuteCode)
		{
			var obj = document.getElementById(ElementId);
			if (obj==undefined || obj==null){if (Core.Effects.Faders[ElementId]!=undefined && Core.Effects.Faders[ElementId][1]!=null){clearTimeout(Core.Effects.Faders[ElementId][1]); Core.Effects.Faders[ElementId]=null;} return;}
			if (Core.Session.Effects==false){Core.Effects.SetOpacity(ElementId,Opacity);}
			if ((obj.style.opacity*100)<Opacity)
			{
				if (Core.Effects.Faders[ElementId]!=null && Core.Effects.Faders[ElementId][0]!=0) {clearTimeout(Core.Effects.Faders[ElementId][1]); Core.Effects.Faders[ElementId]=null;}
				var tmpOpacity = (obj.style.opacity*100) + 2;
				Core.Effects.Faders[ElementId]=new Array(0,setTimeout("Core.Effects.SetOpacity('"+ElementId+"',"+tmpOpacity+"); Core.Effects.Fade('"+ElementId+"',"+Opacity+","+Interval+",'"+ExecuteCode+"');",Interval));
			}
			else if ((obj.style.opacity*100)>Opacity)
			{
				if (Core.Effects.Faders[ElementId]!=null && Core.Effects.Faders[ElementId][0]!=1) {clearTimeout(Core.Effects.Faders[ElementId][1]); Core.Effects.Faders[ElementId]=null;}
				var tmpOpacity = (obj.style.opacity*100) - 2;
				Core.Effects.Faders[ElementId]=new Array(1,setTimeout("Core.Effects.SetOpacity('"+ElementId+"',"+tmpOpacity+"); Core.Effects.Fade('"+ElementId+"',"+Opacity+","+Interval+",'"+ExecuteCode+"');",Interval));
			}
			else
			{
				if (Core.Effects.Faders[ElementId]!=undefined){clearTimeout(Core.Effects.Faders[ElementId][1]); Core.Effects.Faders[ElementId]=null;}
				Core.Statistics.TotalEffects++;
				if (ExecuteCode!=null && ExecuteCode!=undefined)
				{
					try
					{
						eval(ExecuteCode);
					}
					catch(e)
					{
						//Do Nothing
						//May add something here later
					}
				}
			}
		},
		ColourFade:function(ElementId,NewColour,ColourType,Interval,ExecuteCode)
		{
			var obj = document.getElementById(ElementId);
			if (obj==undefined || obj==null){if (Core.Effects.ColourFaders[ElementId]!=undefined){clearTimeout(Core.Effects.ColourFaders[ElementId]); delete Core.Effects.ColourFaders[ElementId];} return;}
			if (Core.Session.Effects==false){obj.style.backgroundColor=NewColour;}
			var OrigRGB = Core.Effects.ColourToRGB(eval("obj."+ColourType+";"));
			var NewRGB = Core.Effects.ColourToRGB(NewColour);
			var nextRGB = Core.Effects.ColourNextRGB(OrigRGB,NewRGB,Interval);
			if (Core.Effects.ColourRGBStyle(nextRGB)!=Core.Effects.ColourRGBStyle(OrigRGB))
			{
				Core.Effects.ColourFaders[ElementId]=setTimeout("document.getElementById('"+ElementId+"')."+ColourType+"='"+Core.Effects.ColourRGBStyle(nextRGB)+"'; Core.Effects.ColourFade('"+ElementId+"','"+NewColour+"','"+ColourType+"',"+Interval+",'"+ExecuteCode+"');",10);
			}
			else
			{
				if (Core.Effects.ColourFaders[ElementId]!=undefined){clearTimeout(Core.Effects.ColourFaders[ElementId]); delete Core.Effects.ColourFaders[ElementId];}
				Core.Statistics.TotalEffects++;
				if (ExecuteCode!=null && ExecuteCode!=undefined)
				{
					try
					{
						eval(ExecuteCode);
					}
					catch(e)
					{
						//Do Nothing
						//May add something here later
					}
				}
			}
		},
		//Major Browsers Supported
		SetOpacity:function(ElementId,Opacity)
		{
			if (document.getElementById(ElementId)==null){return;}
			var object=document.getElementById(ElementId).style;
			object.filter="alpha(opacity="+Opacity+")";
			object.opacity=Opacity/100;
			object.MozOpacity=Opacity/100;
			object.KhtmlOpacity=Opacity/100;
		},
		ColourToRGB:function(Colour)
		{
			if (Colour==undefined || Colour==""){return [0,0,0];}
			//if (Colour.length==3) {return Colour;}
			if (Colour.substring(0,1)=="#"){Colour=Colour.substring(1);}
			if (Colour.substring(0,3)=="rgb")
			{
				var r = Colour.substring(4,Colour.indexOf(","));
				var g = Colour.substring(Colour.indexOf(",")+1,Colour.lastIndexOf(","));
				var b = Colour.substring(Colour.lastIndexOf(",")+1,Colour.indexOf(")"));
				return [parseInt(r),parseInt(g),parseInt(b)];
			}
			return [parseInt(Colour.substring(0,2), 16),parseInt(Colour.substring(2,4), 16),parseInt(Colour.substring(4,6), 16)];
		},
		ColourNextRGB:function(RGB1,RGB2,Interval)
		{
			var RGB = new Array();
			for (var i = 0; i < 3; i++)
			{
				if (RGB1[i]==RGB2[i]){RGB[i]=RGB1[i]; continue;}
				if (Math.max(RGB1[i],RGB2[i])-Math.min(RGB1[i],RGB2[i])<Interval){RGB[i]=RGB2[i];continue;}
				if (RGB1[i]<RGB2[i])
				{
					RGB[i]=RGB1[i]+Interval;
					continue;
				}
				else if (RGB1[i]>RGB2[i])
				{
					RGB[i]=RGB1[i]-Interval;
					continue;
				}
			}
			return RGB;
		},
		ColourRGBStyle:function(RGB)
		{
			return "rgb("+RGB[0]+","+RGB[1]+","+RGB[2]+")";
		},
		HideWindows:function(Opacity,NotMeId)
		{
			for (var i = 0; i < Core.Applications.Windows.length; i++)
			{
				if (Core.Applications.Windows[i]!=null)
				{
					var obj = document.getElementById("Window-"+Core.Applications.Windows[i]["Id"]);
					if (obj!=null && obj.id!="Window-"+NotMeId)
					{
						Core.Effects.Fade(obj.id,Opacity,10,null);
					}
				}
			}
			return true;
		},
		ShowWindows:function()
		{
			for (var i = 0; i < Core.Applications.Windows.length; i++)
			{
				if (Core.Applications.Windows[i]!=null)
				{
					var obj = document.getElementById("Window-"+Core.Applications.Windows[i]["Id"]);
					if (obj!=null)
					{
						Core.Effects.Fade(obj.id,100,10,null);
					}
				}
			}
			return true;
		},
	},
	Applications:{
		Cleanup:function()
		{
			for (var i = 0; i < Core.Applications.Windows.length; i++)
			{
				if (Core.Applications.Windows[i]!=undefined && Core.Applications.Applications[Core.Applications.Windows[i]["ParentApp"]]==undefined)
				{
					Core.Applications.DestroyWindow(i);
				}
			}
		},
		Cache:new Array(),
		IsCached:function(AppPath)
		{
			for (var i = 0; i < Core.Applications.Cache.length; i++)
			{
				if (Core.Applications.Cache[i]!=null && Core.Applications.Cache[i]["AppPath"]==AppPath)
				{
					return true;
				}
			}
			return false;
		},
		GetCacheItem:function(Type,AppPath)
		{
			for (var i = 0; i < Core.Applications.Cache.length; i++)
			{
				if (Core.Applications.Cache[i]!=null && Core.Applications.Cache[i]["AppPath"]==AppPath)
				{
					return Core.Applications.Cache[i];
				}
			}
			return null;
		},
		Applications:new Array(),
		NextAppID:0,
		NextWinID:0,
		Windows:new Array(),
		WinResizeId:null,
		WinMoveId:null,
		RunFromText:function(Name,Text,Arguments)
		{
			try
			{
				var AppID=Core.Applications.NextAppID;
				Core.Applications.NextAppID++;
				var AppCode=Text.slice(Text.indexOf("Code::")+6,Text.length);
				eval("var AppID="+AppID+"; Core.Applications.Applications["+AppID+"]"+AppCode);
				Core.Applications.Applications[AppID].Description = "";
				Core.Applications.Applications[AppID].OnLaunch(Arguments);
			}
			catch(e)
			{
				Core.Statistics.TotalApplicationErrors++;
				Core.Applications.ThrowError("An error occured while launching an application!",Name,e.message);
				Core.Applications.Terminate(AppID);
			}
		},
		Run:function(Path,Type,Arguments)
		{
			var cacheItem = Core.Applications.GetCacheItem(Type,Path);
			Core.ServerCall.SendRequest("index.php?action=fs-get&encode=true&type="+escape(Type)+"&path="+escape(Path),"ctype=false",function(Data){
				if (Data!=null && Data!=""){Core.Applications.RunFromText(Core.Parse.FileName(Path),Data,Arguments);return;}
				Core.Applications.ThrowError("Failed to get application from server! You may not have permission to access this resource!",Core.Parse.FileName(Path),"Application Request Failed");
				});
		},
		Window:function(X,Y,Width,Height,ParentApp)
		{
			var WinID=Core.Applications.NextWinID;
			Core.Applications.NextWinID++;
			
			Core.Statistics.TotalWindowsOpened++;
			
			this["Id"]=WinID;
			this["X"]=X;
			this["Y"]=Y;
			this["Width"]=Width;
			this["Height"]=Height;
			this["ParentApp"]=ParentApp;
			this["AllowMaximise"]=true;
			this["Maximised"]=false;
			this["AllowMinimise"]=true;
			this["Minimised"]=false;
			this["AllowResize"]=true;
			this["AllowClose"]=true;
			this["LinkWithApp"]=true;
			this["MinWidth"]=80;
			this["MinHeight"]=160;
			this["PrevX"]=X;
			this["PrevY"]=Y;
			this["PrevWidth"]=Width;
			this["PrevHeight"]=Height;
			
			var win = document.createElement("div");
			win.id="Window-"+WinID;
			
			var WindowCode = '<div class="Window-Titlebar-Focused" style="border:thin solid; left:0; top:0; right:1px; height:22px; border-color:#000000;" ondblclick="Core.Applications.MaximiseWindow('+WinID+');" id="Window-'+WinID+'-Move" onmousedown="Core.Applications.MoveWindow('+WinID+');" title="New Window"><img style="position:inherit; left:0px;" width="22px" height="22px" src="" /><span class="Window-Title" style="position: absolute; overflow:hidden; left: 26px; top: 3px; height: 20px;" id="Window-'+WinID+'-Title"></span></div><div style="position:inherit; right:0px; top:0px;" id="Window-'+WinID+'-Control"><div class="Window-Minimise" style="position:inherit; top:4px; right:36px; width:16px; height:16px;" onclick="Core.Applications.MinimiseWindow('+WinID+');" title="Minimise"></div><div class="Window-Maximise" style="position:inherit; top:4px; right:19px; width:16px; height:16px;" onclick="Core.Applications.MaximiseWindow('+WinID+');" title="Maximise"></div><div class="Window-Close" style="position:inherit; top:4px; right:2px; width:16px; height:16px;" onclick="Core.Applications.CloseWindow('+WinID+');" title="Close"></div></div><div class="Window-Inner" style="background-color:#FFFFFF; left:0; top:36px; width:'+(Width)+'px; height:'+(Height-24)+'px; overflow:hidden;" id="Window-'+WinID+'-Inner"></div><div class="Window-Resize" title="Resize" id="Window-'+WinID+'-Resize" style="position:inherit; border:thin solid #000000; right:0px; bottom:0px; width:16px; height:16px;" onmousedown="Core.Applications.ResizeWindow('+WinID+');"></div>';
			
			//Set Rest of Parameters
			win.style.position="absolute";
			win.onmousedown=function() {Core.Applications.Focus(WinID);}
			win.style.border="thin solid #000000";
			win.style.opacity=0;
			win.style.backgroundColor="#FFFFFF";
			win.style.left=X+"px";
			win.style.top=Y+"px";
			win.style.width=Width+"px";
			win.style.height=Height+"px";
			win.style.overFlow="hidden";
			win.style.zIndex=WinID;
			win.innerHTML=WindowCode;
			document.body.appendChild(win);
			Core.Applications.Windows[WinID]=this;
			Core.Applications.Focus(WinID);
			Core.Menu.AddItem(WinID,"index.php?action=fs-get&type=themes&path=default/32/apps/preferences-system-windows.png");
			Core.Effects.Fade("Window-"+WinID,100,5);
			return Core.Applications.Windows[WinID];
		},
		ThrowError:function(Text,AppName,Description)
		{
			var txt="Novis Error\n\n";
			txt+=Text+"\n\n";
			txt+="Application: " + AppName + "\n";
			txt+="Error Description: " + Description +"\n";
			alert(txt);
		},
		GetAppInfo:function(Text)
		{
			//Adopted from Iteva 0.7
			var AppInfo=Text.slice(0,Text.indexOf("Code::"));
			var AppInfo=AppInfo.split("\n");
			var AppData=new Array();
			var CurrentLine;
			for (CurrentLine in AppInfo)
			{
				if (AppInfo[CurrentLine]!="" && AppInfo[CurrentLine].indexOf("//")!=0)
				{
					var SplitLine=AppInfo[CurrentLine].split("::");
					AppData[SplitLine[0].replace(/^\s+|\s+$/g,'')]=SplitLine[1].replace(/^\s+|\s+$/g,'');
				}
			}
			return AppData;
		},
		CloseApplication:function(Id,Force)
		{
			for (var i = 0; i < Core.Applications.Windows.length; i++)
			{
				if (Core.Applications.Windows[i]!=undefined && Core.Applications.Windows[i]!=null && Core.Applications.Windows[i]["ParentApp"]==Id)
				{
					Core.Applications.CloseWindow(i,true,false);
				}
			}
			if (Core.Applications.Applications[Id].OnClose!=null && (Force==false || Force==undefined)) {if (Core.Applications.Applications[Id].OnClose()==false){return false;}}
			delete Core.Applications.Applications[Id];
		},
		CloseWindow:function(Id,Force,CheckLink)
		{
			if (Core.Applications.Windows[Id]["LinkWithApp"] && CheckLink!=false)
			{
				Core.Applications.CloseApplication(Core.Applications.Windows[Id]["ParentApp"],Force);
				return null;
			}
			if (Force==undefined || Force==false){if (Core.Applications.Windows[Id]["AllowClose"]==false){return false;}}
			if (Core.Applications.Applications[Core.Applications.Windows[Id]["ParentApp"]].OnWindowClose!=null) {var result = Core.Applications.Applications[Core.Applications.Windows[Id]["ParentApp"]].OnWindowClose(Id); if (result==false){return false;}}
			Core.Applications.DestroyWindow(Id);
			return true;
		},
		DestroyWindow:function(Id)
		{
			if (document.getElementById("Window-"+Id)==null){return false;}
			document.body.removeChild(document.getElementById("Window-"+Id));
			delete Core.Applications.Windows[Id];
			Core.Menu.DeleteItem(Id);
			return true;
		},
		ResizeWindow:function(Id)
		{
			if (Core.Applications.Windows[Id]["Maximised"] || Core.Applications.Windows[Id]["AllowResize"]==false){return;}
			Core.Environment.PrevMouseX=Core.Environment.MouseX;
			Core.Environment.PrevMouseY=Core.Environment.MouseY;
			Core.Applications.WinResizeId=Id;
			Core.Effects.Fade("Window-"+Id,30,10);
		},
		MoveWindow:function(Id)
		{
			if (Core.Applications.Windows[Id]["Maximised"] || Core.Applications.Windows[Id]["AllowMove"]==false){return;}
			Core.Environment.PrevMouseX=Core.Environment.MouseX;
			Core.Environment.PrevMouseY=Core.Environment.MouseY;
			Core.Applications.WinMoveId=Id;
			Core.Effects.Fade("Window-"+Id,30,10);
		},
		MinimiseWindow:function(Id)
		{
			var obj = document.getElementById("Window-"+Id);
			if (obj!=null && Core.Applications.Windows[Id]["AllowMinimise"])
			{
				if (Core.Applications.Windows[Id]["Minimised"]==false)
				{
					Core.Applications.Windows[Id]["Minimised"]=true;
					obj.style.display="none";
				}
				else
				{
					Core.Applications.Windows[Id]["Minimised"]=false;
					obj.style.display="block";
				}
			}
			if (Core.Applications.Applications[Core.Applications.Windows[Id]["ParentApp"]].OnMinimise!=null) {Core.Applications.Applications[Core.Applications.Windows[Id]["ParentApp"]].OnMinimise(Id);}
		},
		MaximiseWindow:function(Id)
		{
			var obj = document.getElementById("Window-"+Id);
			if (obj!=null && Core.Applications.Windows[Id]["AllowMaximise"])
			{
				if (Core.Applications.Windows[Id]["Maximised"])
				{
					Core.Applications.Windows[Id]["Maximised"]=false;
					obj.style.left=Core.Applications.Windows[Id]["PrevX"]+"px";
					obj.style.top=Core.Applications.Windows[Id]["PrevY"]+"px";
					obj.style.width=Core.Applications.Windows[Id]["PrevWidth"]+"px";
					obj.style.height=Core.Applications.Windows[Id]["PrevHeight"]+"px";
					document.getElementById("Window-"+Id+"-Inner").style.width=Core.Applications.Windows[Id]["PrevWidth"]+"px";
					document.getElementById("Window-"+Id+"-Inner").style.height=(Core.Applications.Windows[Id]["PrevHeight"]-24)+"px";
					document.getElementById("Window-"+Id+"-Control").getElementsByTagName("div")[1].title="Maximise";
					document.getElementById("Window-"+Id+"-Control").getElementsByTagName("div")[1].className="Window-Maximise";
				}
				else
				{
					Core.Applications.Windows[Id]["Maximised"]=true;
					Core.Applications.Windows[Id]["PrevX"]=parseInt(obj.style.left);
					Core.Applications.Windows[Id]["PrevY"]=parseInt(obj.style.top);
					Core.Applications.Windows[Id]["PrevWidth"]=parseInt(obj.style.width);
					Core.Applications.Windows[Id]["PrevHeight"]=parseInt(obj.style.height);
					obj.style.left="0px";
					obj.style.top="22px";
					obj.style.width="100%";
					obj.style.height=(Core.Environment.Height-23)+"px";
					document.getElementById("Window-"+Id+"-Inner").style.height=(Core.Environment.Height-47)+"px";
					document.getElementById("Window-"+Id+"-Inner").style.width=Core.Environment.Width+"px";
					document.getElementById("Window-"+Id+"-Control").getElementsByTagName("div")[1].title="Restore Down";
					document.getElementById("Window-"+Id+"-Control").getElementsByTagName("div")[1].className="Window-Restore";
				}
			}
			if (Core.Applications.Applications[Core.Applications.Windows[Id]["ParentApp"]].OnMaximise!=null) {Core.Applications.Applications[Core.Applications.Windows[Id]["ParentApp"]].OnMaximise(Id);}
		},
		SetResize:function(Id)
		{
			var obj = document.getElementById("Window-"+Id);
			if (obj==undefined || obj==null) {return;}
			Core.Applications.Windows[Id]["Width"]=parseInt(obj.style.width);
			Core.Applications.Windows[Id]["Height"]=parseInt(obj.style.height);
			if (Core.Applications.Applications[Core.Applications.Windows[Id]["ParentApp"]].OnResize!=null) {Core.Applications.Applications[Core.Applications.Windows[Id]["ParentApp"]].OnResize(Id);}
		},
		SetMove:function(Id)
		{
			var obj = document.getElementById("Window-"+Id);
			if (obj==undefined || obj==null) {return;}
			Core.Applications.Windows[Id]["X"]=parseInt(obj.style.left);
			Core.Applications.Windows[Id]["Y"]=parseInt(obj.style.top);
			if (Core.Applications.Applications[Core.Applications.Windows[Id]["ParentApp"]].OnMove!=null) {Core.Applications.Applications[Core.Applications.Windows[Id]["ParentApp"]].OnMove(Id);}
		},
		Focus:function(Id)
		{
			var obj = document.getElementById("Window-"+Id);
			if (obj==null || obj.style.zIndex==Core.Applications.NextWinID) {return;}
			obj.style.zIndex=Core.Applications.NextWinID;
			document.getElementById("Window-"+Id+"-Move").className="Window-Titlebar-Focused";
			if (Core.Applications.Applications[Core.Applications.Windows[Id]["ParentApp"]].OnFocus!=null) {Core.Applications.Applications[Core.Applications.Windows[Id]["ParentApp"]].OnFocus(Id);}
			for(var i = 0; i < Core.Applications.Windows.length; i++)
			{
				if (Core.Applications.Windows[i]==undefined || Core.Applications.Windows[i]==null || i==Id) {continue;}
				var winObj = document.getElementById("Window-"+i);
				if (winObj.style.zIndex>0) {winObj.style.zIndex-=1;}
				document.getElementById("Window-"+i+"-Move").className="Window-Titlebar-Unfocused";
				if (Core.Applications.Applications[Core.Applications.Windows[i]["ParentApp"]].OnBlur!=null) {Core.Applications.Applications[Core.Applications.Windows[i]["ParentApp"]].OnBlur(i);}
			}
		},
	},
	Parse:{
		ValidateFileName:function(Name)
		{
			Name=Name.replace('/',"");
			Name=Name.replace('\\',"");
			Name=Name.replace(':',"");
			Name=Name.replace('*',"");
			Name=Name.replace('?',"");
			Name=Name.replace('"',"");
			Name=Name.replace('<',"");
			Name=Name.replace('>',"");
			return Name.replace('|',"");
		},
		ValidatePath:function(Path)
		{
			Path=Path.replace('\\',"");
			Path=Path.replace(':',"");
			Path=Path.replace('*',"");
			Path=Path.replace('?',"");
			Path=Path.replace('"',"");
			Path=Path.replace('<',"");
			Path=Path.replace('>',"");
			return Path.replace('|',"");
		},
		ParentDirectoryName:function(Path)
		{
			Path=Path.slice(0,Path.lastIndexOf("/"));
			Path=Path.slice(Path.lastIndexOf("/")+1,Path.length);
			return Path;
		},
		ParentDirectory:function(Path)
		{
			if (Path=="/"||Path.lastIndexOf("/")==0) { return "/"; }
			Path=Path.slice(0,Path.lastIndexOf("/"));
			return Path;
		},
		FileName:function(Path)
		{
			var tmpLastPos = Path.lastIndexOf('/');
			if (tmpLastPos==-1){return Path;}
			Path=Path.slice(Path.lastIndexOf("/")+1,Path.length);
			return Path;
		},
		FileExtension:function(Path)
		{
			if (Path.lastIndexOf(".")!=-1&&Path.lastIndexOf(".")!=0)
			{
				Path=Path.slice(Path.lastIndexOf(".")+1,Path.length);
				return Path;
			}
			else
			{
				return null;
			}
		},
		FileNameWithoutExtension:function(Path)
		{
			Path=Path.slice(Path.lastIndexOf("/")+1,Path.length);
			if (Path.lastIndexOf(".")!=-1&&Path.lastIndexOf(".")!=0)
			{
				Path=Path.slice(0,Path.lastIndexOf("."));
			}
			return Path;
		},
		GetIdFromWindow:function(WindowID)
		{
			return WindowID.substr(7);
		},
		IsInbetween:function(Value,Start,End)
		{
			if (Value>=Start && Value<=End){return true;}
			return false;
		},
		BreakApartChunks:function(ChunkString)
		{
			try
			{
				//Parse the Front and End of File
				ChunkString = ChunkString.substr(1,ChunkString.length-2);
				//Split Files
				var singleChunks = ChunkString.split('][');
				for (var i = 0; i < singleChunks.length; i++)
				{
					//Split Attributes
					singleChunks[i]=singleChunks[i].split('|');
				}
				return singleChunks;
			}
			catch(e)
			{
				return false;
			}
		},
		GetPath:function(Type,Path)
		{
			if (Type=="config"){ Path=Core.Paths.Config+"/"+Path; }
			if (Type=="apps"){ Path=Core.Paths.Config+"/apps/"+Path; }
			if (Type=="static"){ Path=Core.Paths.Static+"/"+Path; }
			if (Type=="themes"){ Path=Core.Paths.Themes+"/"+Path; }
			if (Type=="ctheme"){ Path=Core.Paths.Themes+"/"+Core.Session.CurrentTheme+"/"+Path; }
			if (Type=="home"){ Path=Core.Paths.Users+"/"+Core.Session.Username+"/"+Path; }
			return Path;
		},
	},
	Environment:{
		MouseX:0,
		MouseY:0,
		PrevMouseX:0,
		PrevMouseY:0,
		Width:0,
		Height:0,
		Resize:function()
		{
			Core.Environment.Width=window.innerWidth;
			Core.Environment.Height=window.innerHeight;
			if (document.getElementById("Desktop-Icons")!=null)
			{
				document.getElementById("Desktop-Icons").style.width=Core.Environment.Width+"px";
				document.getElementById("Desktop-Icons").style.height=Core.Environment.Height+"px";
			}
			for (var i = 0; i < Core.Applications.Windows.length; i++)
			{
				if (Core.Applications.Windows[i]!=null && Core.Applications.Windows[i]!=undefined && Core.Applications.Windows[i]["Maximised"])
				{
					document.getElementById("Window-"+i).style.height=(Core.Environment.Height-23)+"px";
					document.getElementById("Window-"+i+"-Inner").style.width=Core.Environment.Width+"px";
					document.getElementById("Window-"+i+"-Inner").style.height=(Core.Environment.Height-47)+"px";
					Core.Applications.SetResize(i);
				}
			}
			Core.Menu.AdjustPosition();
			Core.Statistics.TotalBrowserResizes++;
		},
	},
	Session:{
		ClosePrompt:false,
		Extensions:null,
		Effects:true,
		Logout:function()
		{
			if (Core.Session.ClosePrompt==false){return false;}
			if (confirm("Are you sure you want to logout?"))
			{
				Core.MessageBox.ShowMessage("index.php?action=fs-get&type=themes&path=default/32/actions/system-log-out.png","Goodbye!");
				Core.Session.ClosePrompt=false;
				Core.Sound.DestroyAll();
				Core.Effects.Fade("Desktop-Icons",0,5,'document.getElementById("Desktop-Icons").style.display="none";document.getElementById("Desktop-Icons").innerHTML="";');
				document.getElementById("NotLoggedIn").style.display="block";
				Core.Effects.Fade("NotLoggedIn",100,5);
				document.getElementById("WinControls").style.display="none";
				for (var i = 0; i < Core.Applications.Applications.length; i++)
				{
					if (Core.Applications.Applications[i]!=null || Core.Applications.Applications[i]!=undefined)
					{
						Core.Applications.CloseApplication(i,true);
					}
				}
				Core.ServerCall.SendRequest("index.php?action=logout","");
				Core.Applications.Run("login.js","static","");
			}
			return false;
		},
		Username:"",
		CurrentTheme:"",
		RefreshUserInfo:function()
		{
			Core.ServerCall.SendRequest("index.php?get=username","",function(Data){Core.Session.Username=Data;});
			Core.ServerCall.SendRequest("index.php?get=ctheme","",function(Data){Core.Session.CurrentTheme=Data;});
			Core.Desktop.LoadExtensions();
		},
	},
	API:{
		Windows:{
			Resize:function(Id,Width,Height)
			{
				var obj = document.getElementById("Window-"+Id);
				if (obj==undefined || obj==null){return;}
				obj.style.width=Width+"px";
				document.getElementById("Window-"+Id+"-Inner").style.width=Width+"px";
				obj.style.height=Height+"px";
				document.getElementById("Window-"+Id+"-Inner").style.height=Height+"px";
				Core.Applications.SetResize(Id);
			},
			Move:function(Id,X,Y)
			{
				var obj = document.getElementById("Window-"+Id);
				if (obj==undefined || obj==null){return;}
				obj.style.left=X+"px";
				obj.style.top=Y+"px";
				Core.Applications.SetMove(Id);
			},
			Title:function(Id,NewTitle)
			{
				if (NewTitle==undefined){return document.getElementById("Window-"+Id+"-Title").innerHTML;}
				document.getElementById("Window-"+Id+"-Move").title=NewTitle;
				document.getElementById("Window-"+Id+"-Title").innerHTML=NewTitle;
			},
			Icon:function(Id,NewIcon)
			{
				if (NewIcon==undefined){return document.getElementById("Window-"+Id+"-Move").getElementsByTagName("img")[0].src;}
				document.getElementById("Window-"+Id+"-Move").getElementsByTagName("img")[0].src = NewIcon;
			},
			AllowResize:function(Id,Bool)
			{
				if (Bool==undefined){return Core.Applications.Windows[Id]["AllowResize"];}
				Core.Applications.Windows[Id]["AllowResize"]=Bool;
				var display = "none";
				if (Bool) {display="block";}
				document.getElementById("Window-"+Id+"-Resize").style.display=display;
			},
			CentreWindow:function(Id)
			{
				var obj = Core.Applications.Windows[Id];
				Core.API.Windows.Move(Id,Core.Environment.Width/2-obj["Width"]/2,Core.Environment.Height/2-obj["Height"]/2);
			},
			InnerText:function(Id,Text)
			{
				if (Text==undefined){return document.getElementById("Window-"+Id+"-Inner").innerHTML;}
				document.getElementById("Window-"+Id+"-Inner").innerHTML=Text;
			},
		},
		Desktop:{
			BuildDirectoryStructure:function(Id,DirectoryDump)
			{
				Core.Desktop.BuildDirectoryStructure("Window-"+Id+"-Inner",DirectoryDump);
			},
		},
	},
	Desktop:{
		SelectedIcons:new Array(),
		ThrowError:function(Text)
		{
			Core.Statistics.TotalErrors++;
			Core.MessageBox.ShowMessage("index.php?action=fs-get&type=themes&path=default/32/status/dialog-error.png",Text,true,"error.ogg");
		},
		LoadExtensions:function()
		{
			Core.ServerCall.SendRequest("index.php?action=fs-get&type=config&path=filetypes.cfg","",function(Data){Core.Session.Extensions=Data;});
		},
		GetExtensionInfo:function(Extension)
		{
			//Extension - Launch Application - Display Image Path
			if (Core.Session.Extensions!=null)
			{
				var chunks = Core.Parse.BreakApartChunks(Core.Session.Extensions);
				for (var i = 0; i < chunks.length; i++)
				{
					if (chunks[i][0]==Extension){return chunks[i];}
				}
			}
			return false;
		},
		AlignDirectoryItems:function(ParentElementId,Offset)
		{
			var obj = document.getElementById(ParentElementId);
			if (obj==null){return false;}
			var Rows = Math.floor(parseInt(obj.style.height)/(70+Offset));
			var Cols = Math.floor(parseInt(obj.style.width)/(70+Offset));
			var CurrentRow = 0;
			var CurrentCol = 0;
			var objs = document.getElementById(ParentElementId).getElementsByTagName("div");
			for (var i = 0; i < objs.length; i++)
			{
				objs[i].style.left = (5+CurrentCol*(70+Offset))+"px";
				objs[i].style.top = (5+CurrentRow*(70+Offset))+"px";
				CurrentCol++;
				if (CurrentCol==Cols)
				{
					CurrentCol=0;
					CurrentRow++;
				}
			}
			return true;
		},
		BuildDirectoryStructure:function(ParentElementId,Offset,DirectoryChunkString)
		{
			//File Name - Extension - Path - File Size - Create Time - Modify Time - Access Time
			var obj = document.getElementById(ParentElementId);
			if (obj==null){return false;}
			obj.innerHTML="";
			var Rows = Math.floor(parseInt(obj.style.height)/(70+Offset));
			var Cols = Math.floor(parseInt(obj.style.width)/(70+Offset));
			var CurrentRow = 0;
			var CurrentCol = 0;
			var fileChunks = Core.Parse.BreakApartChunks(DirectoryChunkString);
			if (fileChunks==false){return false;}
			for (var i = 0; i < fileChunks.length; i++)
			{
				var extInfo = Core.Desktop.GetExtensionInfo(fileChunks[i][1]);
				var imgsrc;
				if (extInfo==false){imgsrc="index.php?action=fs-get&type=themes&path="+escape("default/32/status/image-missing.png");}
				else {imgsrc=extInfo[2];}
				var Item = '<div id="'+ParentElementId+"-Icon-"+i+'" class="Icon" style="position:absolute; overflow:hidden; text-align:center; left:'+(5+CurrentCol*(70+Offset))+'px; top:'+(5+CurrentRow*(70+Offset))+'px; width:'+70+'px; height:'+70+'px;" onmousedown="if (event.button==0){Core.Desktop.Select(this.id,\''+fileChunks[i][2]+'\',event);}" oncontextmenu="/*Context Menu Code Here*/ Core.Desktop.OpenSelected();" ondblclick="Core.Desktop.OpenFile(\''+fileChunks[i][2]+'\');"><img width="32" height="32" src="'+imgsrc+'" /><br /><span id="'+ParentElementId+"-Icon-"+i+'-Name" class="Icon-Text">'+fileChunks[i][0]+'</span></div>';
				obj.innerHTML=obj.innerHTML+Item;
				
				CurrentCol++;
				if (CurrentCol==Cols)
				{
					CurrentCol=0;
					CurrentRow++;
				}
			}
			return true;
		},
		OpenFile:function(FilePath)
		{
			var ext = Core.Parse.FileExtension(Core.Parse.FileName(FilePath));
			var extInfo = Core.Desktop.GetExtensionInfo(ext);
			if (extInfo!=false)
			{
				Core.Applications.Run(extInfo[1],"",FilePath);
				return true;
			}
			Core.Desktop.ThrowError('Unable to open "'+Core.Parse.FileName(FilePath)+'". No application is registered for this type!');
			return false;
		},
		OpenSelected:function()
		{
			for (var Icon in Core.Desktop.SelectedIcons)
			{
				if (Icon!=undefined || Icon!=null)
				{
					Core.Desktop.OpenFile(Core.Desktop.SelectedIcons[Icon]);
				}
			}
		},
		Select:function(ElementId,FilePath,Event)
		{
			var obj = document.getElementById(ElementId);
			if (obj==null){return;}
			var parent = obj.parentNode.id;
			if (Core.Desktop.SelectedIcons[parent]==undefined){Core.Desktop.SelectedIcons[parent]=new Array();}
			if (Event.ctrlKey==1)
			{
				if (Core.Desktop.SelectedIcons[parent]!=undefined && Core.Desktop.SelectedIcons[parent][ElementId]!=undefined)
				{
					delete Core.Desktop.SelectedIcons[parent][ElementId];
					obj.className="Icon";
					return;
				}
			}
			else
			{
				for (var Icon in Core.Desktop.SelectedIcons[parent])
				{
					document.getElementById(Icon).className="Icon";
				}
				delete Core.Desktop.SelectedIcons[parent];
				Core.Desktop.SelectedIcons[parent] = new Array();
			}
			Core.Desktop.SelectedIcons[parent][ElementId]=FilePath;
			obj.className="Icon-Selected";
		},
		ClearSelected:function()
		{
		},
	},
	MessageBox:{
		Boxes:new Array(),
		NextBoxId:0,
		ShowMessage:function(Icon,Text,Sound,Type)
		{
			Core.Statistics.TotalMessageBoxes++;
			var Box = document.createElement("div");
			Box.className="Message-Box";
			Box.id="Message-Box-"+Core.MessageBox.NextBoxId;
			Core.MessageBox.NextBoxId++;
			Box.style.position="absolute";
			Box.style.width="300px";
			Box.style.right="0px";
			Box.style.bottom="0px";
			Box.style.height="48px";
			Box.style.opacity=0;
			Box.style.zIndex=Core.MessageBox.NextBoxId-1;
			Box.title=Text;
			Box.destroyed=false;
			Box.onclick=function(){Core.MessageBox.DestroyMessage(this.id);}
			Box.innerHTML="<img style='width:32px; height:32px;' src='"+Icon+"' /><div style='vertical-align:top;position:inherit;left:32px;top:0px;width:268px;'>"+Text+"</div>";
			document.getElementById("MessageBoxes").appendChild(Box);
			Core.Effects.Fade(Box.id,100,3);
			setTimeout('Core.MessageBox.DestroyMessage("'+Box.id+'");',5000);
			if (Sound!=false)
			{
				var sound = "notify.ogg";
				if (Type=="error"){sound="error.ogg";}
				Core.Sound.SimplyPlay("index.php?action=fs-get&type=sound&path="+sound,100);
			}
		},
		DestroyMessage:function(ElementId)
		{
			if(document.getElementById(ElementId)==null || document.getElementById(ElementId).destroyed){return;}
			document.getElementById(ElementId).destroyed=true;
			Core.Effects.Fade(ElementId,0,3,'document.getElementById("MessageBoxes").removeChild(document.getElementById("'+ElementId+'"))');
		},
	},
	Sound:{
		NextPlayerId:0,
		MasterVolume:100,
		CurrentIcon:"audio-volume-high.png",
		GetAudioIcon:function()
		{
			var cVol = Core.Sound.MasterVolume;
			if (cVol==0)
			{
				return "audio-volume-muted.png";
			}
			else if (cVol<=33)
			{
				return "audio-volume-low.png";
			}
			else if (cVol<=66)
			{
				return "audio-volume-medium.png";
			}
			else
			{
				return "audio-volume-high.png";
			}
		},
		SetMenuAudioIcon:function()
		{
			Core.Sound.CheckMasterVolume();
			var newIcon = Core.Sound.GetAudioIcon();
			if (Core.Sound.CurrentIcon!=newIcon){document.getElementById("Sound-Man-Menu-Icon").src="index.php?action=fs-get&type=themes&path=default/22/status/"+newIcon;Core.Sound.CurrentIcon=newIcon;}
		},
		NewPlayer:function(URL,Volume,PlaybackRate,DestroyOnStop)
		{
			var obj = document.getElementById("Sound-Players");
			var NewAudio = document.createElement("audio");
			NewAudio.id = "Sound-Player-"+Core.Sound.NextPlayerId;
			Core.Sound.NextPlayerId++;
			NewAudio.src = URL;
			NewAudio.playbackRate = PlaybackRate;
			if (DestroyOnStop)
			{
				NewAudio.allowCleanup = true;
			}
			obj.appendChild(NewAudio);
			Core.Sound.ChangeVolume(NewAudio.id,Volume);
			return NewAudio.id;
		},
		Load:function(ElementId,URL,Volume,PlaybackRate,PlayNow)
		{
			var obj = document.getElementById(ElementId);
			if (obj==null){return false;}
			obj.src=URL;
			obj.load();
			Core.Sound.ChangeVolume(ElementId,Volume);
			obj.playbackRate = PlaybackRate;
			if (PlayNow) {Core.Sound.Play(ElementId);}
			return true;
		},
		Play:function(ElementId)
		{
			var obj = document.getElementById(ElementId);
			if (obj==null){return false;}
			obj.play();
		},
		Pause:function(ElementId)
		{
			var obj = document.getElementById(ElementId);
			if (obj==null){return false;}
			if (obj.paused){obj.play();return true;}
			obj.pause();
		},
		Stop:function(ElementId)
		{
			var obj = document.getElementById(ElementId);
			if (obj==null){return false;}
			obj.pause();
			obj.currentTime=0;
			return true;
		},
		DestroyPlayer:function(ElementId)
		{
			var obj = document.getElementById("Sound-Players");
			var player = document.getElementById(ElementId);
			if (player==null){return false;}
			player.pause();
			obj.removeChild(player);
			return true;
		},
		ChangePlaybackRate:function(ElementId,Rate)
		{
			var obj = document.getElementById(ElementId);
			if (obj==null){return false;}
			obj.playbackRate = Rate;
			return true;
		},
		ChangeVolume:function(ElementId,Volume)
		{
			var player = document.getElementById(ElementId);
			if (player==null){return false;}
			try
			{
				Volume=round(Volume);
				player.volume = (Volume/100)*(Core.Sound.MasterVolume/100);
			}
			catch(e)
			{
				Core.Firebug(e);
			}
			return true;
		},
		SimplyPlay:function(URL,Volume)
		{
			var player = Core.Sound.NewPlayer(URL,Volume,1.0,true);
			Core.Sound.Play(player);
		},
		SetMasterVolume:function(Volume)
		{
			var old = Core.Sound.MasterVolume;
			Core.Sound.MasterVolume = Volume;
			Core.Sound.ChangeAllVolume(true,old);
		},
		ChangeAllVolume:function(Volume,PrevMasterVolume)
		{
			var objs = document.getElementById("Sound-Players").getElementsByTagName("audio");
			var tmpVol = Volume;
			for (var i = 0; i < objs.length; i++)
			{
				if (Volume==true)
				{
					tmpVol = (objs[i].volume/(PrevMasterVolume/100)*100);
				}
				Core.Sound.ChangeVolume(objs[i].id,tmpVol);
			}
		},
		DestroyAll:function()
		{
			var objs = document.getElementById("Sound-Players").getElementsByTagName("audio");
			for (var i = 0; i < objs.length; i++)
			{
				Core.Sound.DestroyPlayer(objs[i].id);
			}
		},
		Cleanup:function()
		{
			var objs = document.getElementById("Sound-Players").getElementsByTagName("audio");
			for (var i = 0; i < objs.length; i++)
			{
				if (objs[i].ended==true && objs[i].allowCleanup==true)
				{
					Core.Sound.DestroyPlayer(objs[i].id);
				}
			}
		},
		CheckMasterVolume:function()
		{
			if (Core.Sound.MasterVolume>100){Core.Sound.MasterVolume=100;}
			else if (Core.Sound.MasterVolume<0){Core.Sound.MasterVolume=0;}
		},
	},
	Controls:{
		TrackBar:{
			Dragging:false,
			ActiveTrackBar:null,
			LastMouseX:0,
			CreateNew:function(Id,Max)
			{
				return '<div id="'+Id+'"><hr align="left" style="left: 20px; top: 5px; width: '+Max+'px;" class="TrackBar-Bar"><input type="button" style="top: -15px; left: 10px;" class="TrackBar-Knob" onmousedown="Core.Controls.TrackBar.OnMouseDown(this);"></div>';
			},
			SetPercent:function(Id,Percent)
			{
				var maxX = Core.Controls.TrackBar.GetLength(Id)+10;
				var posX = Percent/100*(maxX);
				if (Core.Parse.IsInbetween(posX,10,maxX))
				{
					document.getElementById(Id).getElementsByTagName("input")[0].style.left=posX+"px";
				}
			},
			GetLength:function(Id)
			{
				return parseInt(document.getElementById(Id).getElementsByTagName("hr")[0].style.width);
			},
			GetPercent:function(Id)
			{
				return Math.floor((Core.Controls.TrackBar.GetPosition(Id) - 10)/Core.Controls.TrackBar.GetLength(Id)*100);
			},
			OnDrag:function()
			{
				if(Core.Controls.TrackBar.Dragging && Core.Controls.TrackBar.ActiveTrackBar!=null)
				{
					var posX = Core.Environment.MouseX;
					var knob = document.getElementById(Core.Controls.TrackBar.ActiveTrackBar).getElementsByTagName("input")[0];
					var curX = parseInt(knob.style.left);
					var newX = curX + (posX-Core.Controls.TrackBar.LastMouseX);
					var maxX = Core.Controls.TrackBar.GetLength(Core.Controls.TrackBar.ActiveTrackBar)+10;
					if(newX > maxX){var finX = maxX;}else if(newX < 10){var finX = 10;}else{var finX = newX;Core.Controls.TrackBar.LastMouseX = posX;}
					knob.style.left = finX+"px";
					if (knob.onmove!=undefined)
					{
						knob.onmove(Math.floor((finX - 10)/(maxX-10)*100));
					}
				}
			},
			OnMouseDown:function(Element)
			{
				Core.Controls.TrackBar.ActiveTrackBar = Element.parentNode.id;
				Core.Controls.TrackBar.LastMouseX = Core.Environment.MouseX;
				Core.Controls.TrackBar.Dragging = true;
			},
			OnMouseUp:function()
			{
				Core.Controls.TrackBar.ActiveTrackBar = null;
				Core.Controls.TrackBar.Dragging = false;
			},
			SetMoveEventHandler:function(Id,EventHandler)
			{
				document.getElementById(Id).getElementsByTagName("input")[0].onmove = EventHandler;
			},
		},
	},
}

//Worker Bindings
Core.Workers.Time.Thread.onmessage = Core.Workers.Time.OnMessage;
Core.Workers.Time.Thread.onerror = Core.Workers.Time.OnError;

//Set Cleanup Schedule
setInterval("Core.Cleanup();",5000);
//Set Clock Request AND Sound Icon Check
setInterval("Core.Workers.Time.Message('now'); Core.Sound.SetMenuAudioIcon();",1000);

//Document Events
document.onmousemove=function(e) {
Core.Environment.MouseX = e.clientX;
Core.Environment.MouseY = e.clientY;
var ResizeID = "Window-"+Core.Applications.WinResizeId;
var MoveID = "Window-"+Core.Applications.WinMoveId;
if (Core.Applications.WinResizeId!=null && Core.Parse.IsInbetween(Core.Environment.MouseX,0,Core.Environment.Width) && Core.Parse.IsInbetween(Core.Environment.MouseY,0,Core.Environment.Height))
{
	var NewWidth=(Core.Environment.MouseX-Core.Environment.PrevMouseX)+parseInt(document.getElementById(ResizeID).style.width);
	var NewHeight=(Core.Environment.MouseY-Core.Environment.PrevMouseY)+parseInt(document.getElementById(ResizeID).style.height);
	if (NewWidth>160 && NewWidth>Core.Applications.Windows[Core.Applications.WinResizeId]["MinWidth"])
	{
		Core.Environment.PrevMouseX=Core.Environment.MouseX;
		document.getElementById(ResizeID).style.width=NewWidth+"px";
		document.getElementById(ResizeID+"-Inner").style.width=NewWidth+"px";
	}
	if (NewHeight>80 && NewHeight>Core.Applications.Windows[Core.Applications.WinResizeId]["MinHeight"])
	{
		Core.Environment.PrevMouseY=Core.Environment.MouseY;
		document.getElementById(ResizeID).style.height=NewHeight+"px";
		document.getElementById(ResizeID+"-Inner").style.height=NewHeight-24+"px";
	}
	if (Core.Applications.Applications[Core.Applications.Windows[Core.Applications.WinResizeId]["ParentApp"]].OnResizing!=null) {Core.Applications.Applications[Core.Applications.Windows[Core.Applications.WinResizeId]["ParentApp"]].OnResizing(Core.Applications.WinResizeId);}
}
if (Core.Applications.WinMoveId!=null && Core.Parse.IsInbetween(Core.Environment.MouseX,0,Core.Environment.Width) && Core.Parse.IsInbetween(Core.Environment.MouseY,0,Core.Environment.Height))
{
	var NewX=(Core.Environment.MouseX-Core.Environment.PrevMouseX)+parseInt(document.getElementById(MoveID).style.left);
	var NewY=(Core.Environment.MouseY-Core.Environment.PrevMouseY)+parseInt(document.getElementById(MoveID).style.top);
	if (NewY<0){NewY=0;}
	else {Core.Environment.PrevMouseY=Core.Environment.MouseY;}
	document.getElementById(MoveID).style.left=NewX+"px";
	Core.Environment.PrevMouseX=Core.Environment.MouseX;
	document.getElementById(MoveID).style.top=NewY+"px";
	if (Core.Applications.Applications[Core.Applications.Windows[Core.Applications.WinMoveId]["ParentApp"]].OnMoving!=null) {Core.Applications.Applications[Core.Applications.Windows[Core.Applications.WinMoveId]["ParentApp"]].OnMoving(Core.Applications.WinMoveId);}
}

Core.Controls.TrackBar.OnDrag();
}
document.onmouseup=function() {
if (Core.Applications.WinResizeId!=null){
Core.Effects.Fade("Window-"+Core.Applications.WinResizeId,100,10);
Core.Applications.SetResize(Core.Applications.WinResizeId);
Core.Applications.WinResizeId=null;}

if (Core.Applications.WinMoveId!=null){
Core.Effects.Fade("Window-"+Core.Applications.WinMoveId,100,10);
Core.Applications.SetMove(Core.Applications.WinMoveId);
Core.Applications.WinMoveId=null;}

Core.Controls.TrackBar.OnMouseUp();
}