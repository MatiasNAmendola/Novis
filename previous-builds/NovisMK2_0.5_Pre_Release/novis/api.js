//Novis JavaScript API 0.5
//Copyright (C) 2009
//Created by James Turner

var API = {
	Misc:{
		GetIdFromElement:function(ElementID)
			{
				return(ElementID.substring(7));
			},
		GetElementFromId:function(Id)
			{
				return("Window-"+Id);
			},
		IsLoading:function()
			{
				if (document.getElementById("Loading-Progress").style.display=="none") {return false;}
				return true;
			},
		WindowObject:function(Id)
			{
				return Windows.Windows[Id];
			},
		GetIdFromTitle:function(Title)
			{
				for (var Window in Windows.Windows)
				{
					if (Window.Title==Title) {return Window.Id;}
				}
				return -1;
			},
		GetExtension:function(Name)
			{
				if (Name.lastIndexOf(".")!=-1)
				{
					return Name.substring(Name.lastIndexOf("."));
				}
				return Name;
			},
		DirectoryReady:function(Path)
			{
				if (Path.charAt(Path.length-1)!="/"){return Path+"/";}
				return Path;
			},
	},
	FileSystem:{
		GetFile:function(Path,ReturnTo)
			{
				Core.FileSystem.GetFile(Path,ReturnTo);
			},
		GetDirectory:function(Path,ElementID)
			{
				Core.FileSystem.GetDirectory(Path,ElementID);
			},
		WriteFile:function(Path,Data)
			{
				Core.ServerCall("novis/desktop.php?action=put","path="+escape(Path)+"&contents="+escape(Data),function(){return;});
			},
		MakeDir:function(Path)
			{
				Core.ServerCall("novis/desktop.php?action=put","path="+escape(Path)+"&type=dir",function(){return;});
			},
		FileExists:function(Path,ReturnTo)
			{
				Core.ServerCall("novis/desktop.php?action=chk","path="+escape(Path),ReturnTo);
			},
		RealignDirItems:function(ElementID)
			{
				Core.FileSystem.RealignDirItems(ElementID);
			},
	},
	Application:{
		ChangeTitle:function(Id,Title)
			{
				Windows.Windows[Id].Title=Title;
				document.getElementById("Window-"+Id+"-Move").title=Title;
				document.getElementById("Window-"+Id+"-Title").innerHTML=Title;
			},
		ChangeIcon:function(Id,IconPath)
			{
				document.getElementById("Window-"+Id+"-Move").getElementsByTagName("img")[0].src=Windows.MoveHandleImages+IconPath;
			},
		ChangePosition:function(Id,X,Y)
			{
				if (API.Application.IsMaximised(Id)==true) {return;}
				document.getElementById("Window-"+Id).style.left=X+"px";
				document.getElementById("Window-"+Id).style.top=Y+"px";
			},
		ChangeSize:function(Id,Width,Height)
			{
				if (API.Application.IsMaximised(Id)==true) {return;}
				document.getElementById("Window-"+Id).style.width=Width+"px";
				document.getElementById("Window-"+Id).style.height=Height+"px";
				document.getElementById("Window-"+Id+"-Inner").style.width=(Width)+"px";
				document.getElementById("Window-"+Id+"-Inner").style.height=(Height-24)+"px";
			},
		IsMaximised:function(Id)
			{
				return Windows.Windows[Id].Maximised;
			},
		Maximise:function(Id)
			{
				Windows.MaximiseWindow("Window-"+Id);
			},
		IsMinimised:function(Id)
			{
				return Windows.Windows[Id].Minimised;
			},
		Minimise:function(Id)
			{
				Windows.MinimiseWindow("Window-"+Id);
			},
		CanMaximise:function(Id,Value)
			{
				if (Value==true || Value==false) {Windows.Windows[Id].CanMaximise=Value; return;}
				return Windows.Windows[Id].CanMaximise;
			},
		CanMinimise:function(Id,Value)
			{
				if (Value==true || Value==false) {Windows.Windows[Id].CanMinimise=Value; return;}
				return Windows.Windows[Id].CanMinimise;
			},
		GetMin:function(Id,Type)
			{
				if (Type == "Width")
				{
					return Windows.Windows[Id].MinWidth;
				}
				if (Type == "Height")
				{
					return Windows.Windows[Id].MinHeight;
				}
				return "-1";
			},
		SetMin:function(Id,Width,Height)
			{
				Windows.Windows[Id].MinWidth=Width;
				Windows.Windows[Id].MinHeight=Height;
			},
		MultiInstance:function(AppPath,Arguments)
			{
				for (var i = 0; i < Windows.Windows.length; i++)
				{
					if (Windows.Windows[i]!=undefined && Windows.Windows[i].App==AppPath && Apps[i].OnMultiLaunch!=null) {Apps[i].OnMultiLaunch(Arguments); Windows.Focus("Window-"+i); return true;}
				}
				return false;
			},
		//Application Cache Functions
		IsCached:function(Path)
			{
				for (var i = 0; i < Core.AppCache.length; i++)
				{
					if (Core.AppCache[i][0]==Path)
					{
						return true;
					}
				}
				return false;
			},
		UpdateCache:function(Path)
			{
				for (var i = 0; i < Core.AppCache.length; i++)
				{
					if (Core.AppCache[i][0]==Path)
					{
						Core.ServerCall("novis/desktop.php?action=timestamp","path="+escape(Path),function(Data) {
						if (Data.Status==200 && Data.Text!=Core.AppCache[i][1])
						{
							Core.ServerCall("novis/desktop.php?action=get","path="+escape(Path),function(AppCode){
							Core.AppCache[i][1]=Data.Text;
							Core.AppCache[i][2]=AppCode;
							});
						}});
					}
				}
			},
		UpdateEntireCache:function()
			{
				for (var i = 0; i < Core.AppCache.length; i++)
				{
					var Path = Core.AppCache[i][0];
					Core.ServerCall("novis/desktop.php?action=timestamp","path="+escape(Path),function(Data) {
					if (Data.Status==200 && Data.Text!=Core.AppCache[i][1])
					{
						Core.ServerCall("novis/desktop.php?action=get","path="+escape(Path),function(AppCode){
						Core.AppCache[i][1]=Data.Text;
						Core.AppCache[i][2]=AppCode;
						});
					}});
				}
			},
		CacheApplication:function(Path,Code)
			{
				Core.ServerCall("novis/desktop.php?action=timestamp","path="+escape(Path),function(Data){
					if (Data.Status==200) {Core.AppCache.push(new Array(Path,Data.Text,Code));}
					else {alert("A "+Data.Status+" error has occured while trying to get the file timestamp of "+Path+"!");}});
			},
		GetCache:function(Path)
			{
				for (var i = 0; i < Core.AppCache.length; i++)
				{
					if (Core.AppCache[i][0]==Path)
					{
						return Core.AppCache[i][2];
					}
				}
			},
	},
	Shell:{
		Open:function(Path,Arguments,NewInstance)
			{
				//Main Function to Open Applications
				var ext = API.Misc.GetExtension(Path);
				if (ext==Path){ext="dir"}
				var extInfo = Core.FileSystem.GetExtensionInfo(ext);
				if (extInfo!=false)
					{
						if ((NewInstance==false || NewInstance==undefined) && API.Application.MultiInstance(extInfo[2],Arguments)==true) {return;}
						if (extInfo[2]=="eval")
							{
								Windows.CreateWindow(200,100,350,350,Path,Arguments);
							}
						else
							{
								Windows.CreateWindow(200,100,350,350,extInfo[2],Arguments);
							}
						return true;
					}
				alert("Novis has no application that is registered for opening this file type!"+"\n"+"File Type: "+ext);
				return false;
			},
	},
	Panel:{
		MovePanel:function(Position,Contents)
			{
				Core.Panel.Move(Position,Contents);
			},
		ChangeText:function(Contents)
			{
				Core.Panel.Modify(Contents);
			},
		GetPosition:function()
			{
				return(Core.Panel.Position);
			},
		GetContents:function()
			{
				return(document.getElementById("Panel-Contents").innerHTML);
			},
		GetPreviousContents:function()
			{
				return(Core.Panel.PreviousText);
			},
	},
	Session:{
		Logout:function()
			{
				Core.Session.DoLogout();
			},
		CreateUser:function(Username,Password)
			{
				Core.Session.DoNewUser(Username,Password);
			},
	},
	Widgets:
		{
			Add:{
				DirectoryElement:function(Id,X,Y,Width,Height)
					{
						//Consider parseInt() instead of all this code!
						if (isNaN(X) && X.indexOf("px")!=-1) {X=X.substring(0,X.length-2);}
						if (isNaN(Y) && Y.indexOf("px")!=-1) {Y=Y.substring(0,Y.length-2);}
						if (isNaN(Width) && Width.indexOf("px")!=-1) {Width=Width.substring(0,Width.length-2);}
						if (isNaN(Height) && Height.indexOf("px")!=-1) {Height=Height.substring(0,Height.length-2);}
						return '<div id="'+Id+'" style="position:absolute; overflow:scroll; left:'+X+'px; top:'+Y+'px; width:'+Width+'px; height:'+Height+'px"></div>';
					},
			},
			Change:{
				DirectoryPath:function(DirElementID,Path)
					{
						Core.ServerCall("novis/desktop.php?action=per","path="+escape(Path),function(Data){
							if (Data.Text=="true")
							{
								API.FileSystem.GetDirectory(Path,DirElementID);
							}
							else
							{
								alert("You do not have permission to access this path!");
							}})
					},
			},
		},
}