//Novis JavaScript Window Manager 0.8
//Copyright (C) 2009
//Created by James Turner

//Note: Some Window Effects and Styling inspired from eyeOS
//TODO: Move some functions from here to API

var Windows = {
	BaseDepth:5,
	Windows:new Array(),
	ResizeID:null,
	MoveID:null,
	NextID:0,
	MoveHandleImages:"novis/images/22/",
	IconImages:"novis/images/32/",
	SelectedItems:new Array(),
	WindowObject:function(Id,Title,AppPath,Arguments,X,Y,Width,Height)
		{
			this.Id="Window-"+Id;
			this.Title=Title;
			this.App=AppPath;
			this.Args=Arguments;
			this.Maximised=false;
			this.Minimised=false;
			this.CanMaximise=true;
			this.CanMinimise=true;
			this.MinWidth=80;
			this.MinHeight=160;
			this.OldX=X;
			this.OldY=Y;
			this.OldWidth=Width;
			this.OldHeight=Height;
		},
	Window:function(X,Y,Width,Height)
		{
			//This function is mostly complete 
			//Returns ID
			//Set Window ID
			var id = Windows.NextID;
			Windows.NextID++;
			
			//Create Element and Set ID
			NewWinHandle = document.createElement("div");
			NewWinHandle.id="Window-"+id;
			
			//Set Window Code
			var WindowCode = '<div class="Window-Titlebar-Focused" style="border:thin solid; left:0; top:0; right:1px; height:22px; border-color:#000000;" ondblclick="Windows.MaximiseWindow(\''+NewWinHandle.id+'\');" id="'+NewWinHandle.id+'-Move" onmousedown="Windows.MoveWindow(\''+NewWinHandle.id+'\');" title="New Window"><img style="position:inherit; left:0px;" src="" /><span class="Window-Title" style="position: absolute; overflow:hidden; left: 26px; top: 1px; height: 20px;" id="'+NewWinHandle.id+'-Title"></span></div><div style="position:inherit; right:0px; top:0px;" id="'+NewWinHandle.id+'-Control"><div class="Window-Minimise" style="position:inherit; top:4px; right:36px; width:16px; height:16px;" title="Minimise"></div><div class="Window-Maximise" style="position:inherit; top:4px; right:19px; width:16px; height:16px;" onclick="Windows.MaximiseWindow(\''+NewWinHandle.id+'\');" title="Maximise"></div><div class="Window-Close" style="position:inherit; top:4px; right:2px; width:16px; height:16px;" onclick="Windows.CloseWindow(\''+NewWinHandle.id+'\');" title="Close"></div></div><div style="background-color:#FFFFFF; left:0; top:36px; width:'+(Width)+'px; height:'+(Height-24)+'px; overflow:hidden;" id="'+NewWinHandle.id+'-Inner"></div><div class="Window-Resize" title="Resize" id="'+NewWinHandle.id+'-Resize" style="position:inherit; border:thin solid #000000; right:0px; bottom:0px; width:16px; height:16px;" onmousedown="Windows.ResizeWindow(\''+NewWinHandle.id+'\');"></div>';
			
			//Set Rest of Parameters
			NewWinHandle.style.position="absolute";
			NewWinHandle.onmousedown=function() {Windows.Focus(this.id);}
			NewWinHandle.style.border="thin solid #000000";
			NewWinHandle.style.opacity=1;
			NewWinHandle.style.backgroundColor="#FFFFFF";
			NewWinHandle.style.left=X+"px";
			NewWinHandle.style.top=Y+"px";
			NewWinHandle.style.width=Width+"px";
			NewWinHandle.style.height=Height+"px";
			NewWinHandle.style.overFlow="hidden";
			NewWinHandle.style.zIndex=Windows.BaseDepth+id;
			NewWinHandle.innerHTML=WindowCode;
			document.getElementById("Main-Handle").appendChild(NewWinHandle);
			
			//Quick Focus Window Fix
			for(var i = 0; i < Windows.Windows.length; i++)
			{
				if (Windows.Windows[i]==undefined || Windows.Windows[i].Id==id) {continue;}
				document.getElementById(Windows.Windows[i].Id+"-Move").className="Window-Titlebar-Unfocused";
			}
			
			return id;
		},
	ExecuteApplication:function(X,Y,Width,Height,AppPath,Arguments,Data)
		{
			var id = Windows.Window(X,Y,Width,Height);
			Windows.Windows[id]=new Windows.WindowObject(id,AppPath,AppPath,Arguments,X,Y,Width,Height);
			API.Application.CacheApplication(AppPath,Data);
			document.getElementById("Window-"+id+"-Title").innerHTML=AppPath;
			try
			{
				eval("var AppID="+id+"; Apps["+id+"]"+Data);
				eval("Apps["+id+"]"+".Init();");
			}
			catch(e)
			{
				var txt="An error occured while launching "+AppPath+"!\n\n";
				txt+="Error Description: " + e.message + "\n";
				alert(txt);
				Windows.ForceCloseWindow("Window-"+id);
			}
		},
	CreateWindow:function(X,Y,Width,Height,AppPath,Arguments)
		{
			if (API.Application.IsCached(AppPath))
			{
				API.Application.UpdateCache(AppPath);
				Windows.ExecuteApplication(X,Y,Width,Height,AppPath,Arguments,API.Application.GetCache(AppPath));
			}
			else
			{
				Core.ServerCall("novis/desktop.php?action=get","path="+AppPath,function(Data){
					if (Data.Status==200)
						{
							Windows.ExecuteApplication(X,Y,Width,Height,AppPath,Arguments,Data.Text);
						}
					else{alert('A '+Data.Status+' error occured while trying to access file "'+AppPath+'!');}});
			}
		},
	WindowFrame:function(id,X,Y,Width,Height)
		{
			//Moved
		},
	ResizeWindow:function(ElementID)
		{
			Core.Environment.OldMouseX=Core.Environment.MouseX;
			Core.Environment.OldMouseY=Core.Environment.MouseY;
			Windows.ResizeID=ElementID;
		},
	MoveWindow:function(ElementID)
		{
			Core.Environment.OldMouseX=Core.Environment.MouseX;
			Core.Environment.OldMouseY=Core.Environment.MouseY;
			Windows.MoveID=ElementID;
		},
	CloseWindow:function(ElementID)
		{
			if (document.getElementById(ElementID)!=null)
			{
				//Tells the Application its closing
				if (Apps[API.Misc.GetIdFromElement(ElementID)].OnClose!=null) {if (Apps[API.Misc.GetIdFromElement(ElementID)].OnClose()==false){return false;}}
				//Remove Element
				document.getElementById("Main-Handle").removeChild(document.getElementById(ElementID));
				//Clears Application Data
				delete Windows.Windows[API.Misc.GetIdFromElement(ElementID)];
				delete Apps[API.Misc.GetIdFromElement(ElementID)];
				//Returns Success
				return true;
			}
			return false;
		},
	ForceCloseWindow:function(ElementID)
		{
			if (document.getElementById(ElementID)!=null)
			{
				//Remove Element
				document.getElementById("Main-Handle").removeChild(document.getElementById(ElementID));
				//Clears Application Data
				delete Windows.Windows[API.Misc.GetIdFromElement(ElementID)];
				delete Apps[API.Misc.GetIdFromElement(ElementID)];
				//Returns Success
				return true;
			}
			return false;
		},
	MinimiseWindow:function(ElementID)
		{
			if (document.getElementById(ElementID)!=null)
			{
				if (Windows.Windows[API.Misc.GetIdFromElement(ElementID)].Minimised==false)
				{
					Windows.Windows[API.Misc.GetIdFromElement(ElementID)].Minimised=true;
					document.getElementById(ElementID).style.display="none";
				}
				else
				{
					Windows.Windows[API.Misc.GetIdFromElement(ElementID)].Minimised=false;
					document.getElementById(ElementID).style.display="block";
				}
			}
		},
	MaximiseWindow:function(ElementID)
		{
			if (document.getElementById(ElementID)!=null)
			{
				var id=API.Misc.GetIdFromElement(ElementID)
				if (Windows.Windows[id].Maximised)
				{
					Windows.Windows[id].Maximised=false;
					document.getElementById(ElementID).style.left=Windows.Windows[id].OldX+"px";
					document.getElementById(ElementID).style.top=Windows.Windows[id].OldY+"px";
					document.getElementById(ElementID).style.width=Windows.Windows[id].OldWidth+"px";
					document.getElementById(ElementID).style.height=Windows.Windows[id].OldHeight+"px";
					document.getElementById(ElementID+"-Inner").style.height=(Windows.Windows[id].OldHeight-24)+"px";
					document.getElementById(ElementID+"-Inner").style.width=(Windows.Windows[id].OldWidth)+"px";
					document.getElementById(ElementID+"-Control").getElementsByTagName("div")[1].title="Maximise";
					document.getElementById(ElementID+"-Control").getElementsByTagName("div")[1].className="Window-Maximise";
				}
				else
				{
					Windows.Windows[id].Maximised=true;
					Windows.Windows[id].OldX=parseInt(document.getElementById(ElementID).style.left);
					Windows.Windows[id].OldY=parseInt(document.getElementById(ElementID).style.top);
					Windows.Windows[id].OldWidth=parseInt(document.getElementById(ElementID).style.width);
					Windows.Windows[id].OldHeight=parseInt(document.getElementById(ElementID).style.height);
					document.getElementById(ElementID).style.left="0px";
					document.getElementById(ElementID).style.top="0px";
					document.getElementById(ElementID).style.width="100%";
					document.getElementById(ElementID).style.height="100%";
					document.getElementById(ElementID+"-Inner").style.height=Core.Environment.Height-24+"px";
					document.getElementById(ElementID+"-Inner").style.width=Core.Environment.Width+"px";
					document.getElementById(ElementID+"-Control").getElementsByTagName("div")[1].title="Restore Down";
					document.getElementById(ElementID+"-Control").getElementsByTagName("div")[1].className="Window-Restore";
				}

				if (Apps[id].OnResize!=null)
				{
				Apps[id].OnResize();
				}
			}
		},
	SelectItem:function(ElementID,Event)
		{
			if (Event.ctrlKey==1)
			{		
				for (var i = 0; i < Windows.SelectedItems.length; i++)
				{
					if (Windows.SelectedItems[i][1]==document.getElementById(ElementID).getElementsByTagName("form")[0].firstChild.value) {document.getElementById(ElementID).style.borderStyle="none"; delete Windows.SelectedItems[i]; Windows.SelectedItems.sort(); Windows.SelectedItems.pop(); return;}
				}
				Windows.SelectedItems.push(new Array(ElementID,document.getElementById(ElementID).title));
			}
			else
			{
				for (var i = 0; i < Windows.SelectedItems.length; i++)
				{
					if (document.getElementById(Windows.SelectedItems[i][0])!=null)
					{
					document.getElementById(Windows.SelectedItems[i][0]).style.borderStyle="none";
					}
				}
				Windows.SelectedItems=new Array(new Array(ElementID,document.getElementById(ElementID).getElementsByTagName("form")[0].firstChild.value));
			}
			document.getElementById(ElementID).style.borderStyle="solid";
		},
	ResetResize:function()
		{
			if (Windows.ResizeID==null) {return;}
			document.getElementById(Windows.ResizeID).style.opacity=1;
			Windows.ResizeID=null;
		},
	ResetMove:function()
		{
			if (Windows.MoveID==null) {return;}
			document.getElementById(Windows.MoveID).style.opacity=1;
			Windows.MoveID=null;
		},
	Focus:function(ElementID)
		{
			if (document.getElementById(ElementID)==null || document.getElementById(ElementID).style.zIndex==Windows.BaseDepth+Windows.NextID) {return;}
			document.getElementById(ElementID).style.zIndex=Windows.BaseDepth+Windows.NextID;
			document.getElementById(ElementID+"-Move").className="Window-Titlebar-Focused";
			if (Apps[API.Misc.GetIdFromElement(ElementID)].OnFocus!=null) {Apps[API.Misc.GetIdFromElement(ElementID)].OnFocus();}
			for(var i = 0; i < Windows.Windows.length; i++)
			{
				if (Windows.Windows[i]==undefined || Windows.Windows[i].Id==ElementID) {continue;}
				var id = Windows.Windows[i].Id;
				if (document.getElementById(id).style.zIndex<=Windows.BaseDepth) {document.getElementById(id).style.zIndex=Windows.BaseDepth; continue;}
				document.getElementById(id).style.zIndex-=1;
				document.getElementById(id+"-Move").className="Window-Titlebar-Unfocused";
				if (Apps[i].OnBlur!=null) {Apps[i].OnBlur();}
			}
		},
}

var Apps = new Array();
