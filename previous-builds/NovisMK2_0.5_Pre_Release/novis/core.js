//Novis JavaScript Core 0.5
//Copyright (C) 2009
//Created by James Turner

//TODO: Create framework for user management, Fix code execution problem in "windows.js", Fix context menu problem and fix security in "api.js" and "desktop.php"!
//TODO: Build global settings (novis/system/settings/) for extensions and major features

var Core = {
	CallCount:0,
	Debug:true,
	AppCache:new Array(),
	ServerResponse:function(Response)
		{
			var tmp = Response.split("|");
			this.Status=parseInt(tmp[0]);
			this.Text=unescape(tmp[1]);
		},
	OnLoad:function()
		{
			Core.Effects.CurrentTheme=document.getElementById("Novis-CSS").href;
			Core.Panel.Move(1);
		},
	ServerCall:function(SendTo,SendData,ReturnTo)
		{
			var xmlHttp = new XMLHttpRequest();
			Core.CallCount++;
			if (document.getElementById("Loading-Progress")!=null)
			{
				document.getElementById("Loading-Progress").style.display="block";
				document.getElementById("Loading-Progress").title="Current Server Calls: "+Core.CallCount;
			}
			xmlHttp.onreadystatechange=function()
				{
				if (xmlHttp.readyState==4)
					{
					Core.CallCount--;
					if (document.getElementById("Loading-Progress")!=null)
						{
						if (Core.CallCount==0)
							{
							document.getElementById("Loading-Progress").style.display="none";
							document.getElementById("Loading-Progress").title="";
							}
						else
							{
							document.getElementById("Loading-Progress").title="Current Server Calls: "+Core.CallCount;
							}
						}
					if (xmlHttp.status==200)
						{
						ReturnTo(new Core.ServerResponse(xmlHttp.responseText));
						}
					else
						{
						alert("Internal Error!");
						ReturnTo(new Core.ServerResponse("500|"));
						}
					}
				}
			xmlHttp.open("POST",SendTo,true);
			xmlHttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
			xmlHttp.send(SendData);
		},
	Timers:{
		NewIntervalTimer:function(Name,Code,Timeout)
			{
				this.Name=Name;
				this.Type="Interval";
				this.Id=setInterval(Code,Timeout);
				this.Stop=function(){clearInterval(this.Id);}
			},
		NewTimeoutTimer:function(Name,Code,Timeout)
			{
				this.Name=Name;
				this.Type="Timeout";
				this.Id=setTimeout(Code,Timeout);
				this.Stop=function(){clearTimeout(this.Id);}
			},
	},
	Effects:{
		CurrentTheme:"",
		ChangeTheme:function(Name)
			{
				document.getElementById("Novis-CSS").href="novis/system/themes/"+Name;
				Core.Effects.CurrentTheme="novis/system/themes/"+Name;
				Core.ServerCall("novis/desktop.php?action=settings","name=theme&contents="+Name,function(Data){if (Data.Status!=204){alert("A error has occured while trying to save the current theme!");}});
			},
		Icons:{
			MouseOver:function(Self)
				{
					if (Self!=null)
					{
						Self.className="Icon-Highlight";
					}
				},
			MouseOut:function(Self)
				{
					if (Self!=null)
					{
						Self.className="Icon";
					}
				},
		},
		Buttons:{
			MouseOver:function(Self)
				{
					if (Self!=null)
					{
						Self.className="Button-Highlight";
					}
				},
			MouseOut:function(Self)
				{
					if (Self!=null)
					{
						Self.className="Button";
					}
				},
		},
	},
	Panel:{
		Controls:{
			Settings:{
					ListThemes:function()
						{
							//MAKE IT READ FROM SERVER (THE LIST OF THEMES)
							Core.ServerCall("novis/desktop.php?action=themes","",function(Data){if (Data.Status==200){
									tmp_list='<h3>Themes</h3><hr>';
									splt_list=Data.Text.split("|");
									for (var i = 1; i < splt_list.length; i++)
									{
										tmp_list+='<div class="Button" onMouseOver="Core.Effects.Buttons.MouseOver(this); document.getElementById(\'Novis-CSS\').href=\'novis/system/themes/\'+this.innerHTML" onMouseOut="Core.Effects.Buttons.MouseOut(this); document.getElementById(\'Novis-CSS\').href=Core.Effects.CurrentTheme" onclick="Core.Effects.ChangeTheme(this.innerHTML);">'+splt_list[i]+'</div><br />';
									}
									document.getElementById("Panel-Contents-Inner").innerHTML=tmp_list;
									}});
						},
			},
			//AJAX Uploader inspired by Max's AJAX File Uploader (http://www.ajaxf1.com/)
			Uploader:{
				Uploading:false,
				ShowUploader:function()
					{
						document.getElementById("Panel-Contents-Inner").innerHTML='<form id="Panel-Uploader" style="text-align:center; background-color:rgb(155,155,155);" action="novis/desktop.php?action=upload" method="post" enctype="multipart/form-data" target="Panel-Uploader-Target" onsubmit="Core.Panel.Controls.Uploader.StartUpload();">'+
							'<h3>File Uploader</h3>This allows you to upload files to your Novis account desktop!<br />'+
							'<span id="Panel-Uploader-Input">File: <input name="Panel-Uploader-File" type="file" size="30" /><br />'+
							'<input type="submit" value="Upload" /></span>'+
							'<iframe id="Panel-Uploader-Target" name="Panel-Uploader-Target" src="#" style="width:0;height:0;border:0px solid #fff;"></iframe>'+
							'<br /><span id="Panel-Uploader-Status"></span></form>';
					},
				StartUpload:function()
					{
						if (Core.Panel.Controls.Uploader.Uploading==false)
						{
							document.getElementById("Panel-Uploader-Input").style.display="none";
							document.getElementById("Panel-Uploader-Status").style.color="#000000";
							document.getElementById("Panel-Uploader-Status").innerHTML="Uploading...";
							Core.Panel.Controls.Uploader.Uploading=true;
							return true;
						}
						return false;
					},
				StopUpload:function(Status)
					{
						if (Core.Panel.Controls.Uploader.Uploading)
						{
							var result = new Core.ServerResponse(Status);
							document.getElementById("Panel-Uploader-Input").style.display="block";
							switch(result.Status)
							{
								case 201:
									document.getElementById("Panel-Uploader-Status").style.color="#009900";
									document.getElementById("Panel-Uploader-Status").innerHTML="Success!<br />Refresh the desktop to see the newly uploaded file!";
								break;
								default:
									document.getElementById("Panel-Uploader-Status").style.color="#CC0000";
									document.getElementById("Panel-Uploader-Status").innerHTML="Failure!<br />An unknown error has occured while trying to upload the file!";
								break;
							}
							Core.Panel.Controls.Uploader.Uploading=false;
							return true;
						}
						return false;
					},
			},
			//About Novis
			About:function()
				{
				document.getElementById("Panel-Contents-Inner").innerHTML="<h1>NovisMK2 0.5</h1><hr><strong><a href='http://www.turnersoftware.au.com/'>Created by James Turner</a></strong><br /><br />Some ideas and functions borrowed from Iteva/ItevaMK2 and eyeOS.<br /><br /><br />Thanks to the <a href='http://tango-project.org/'>Tango Project</a> for the icons to Novis, <a href='http://www.premiumbeat.com/'>Premiumbeat</a> for use of their Flash MP3 Player and to the creators of <a href='http://www.mcmediaplayer.com/'>MC Altair Media Player</a>!";
				},
		},
		//Default Text for the Panel (0 = Main Interface)
		DefaultText:new Array('<div style="left:5px; top:5px; right:5px; bottom:5px; position:absolute; overflow:hidden;"><table style="position:absolute; height:100%; bottom:0px; width:100%; text-align:center; vertical-align:middle;"><tr style="height:8px;"><td style="font-size:20px;" colspan="3">WELCOME <strong><span id="Panel-Username"></span></strong>!</td></tr><tr style="height:20px;"><td width="33%" class="Button" onMouseOver="Core.Effects.Buttons.MouseOver(this);" onMouseOut="Core.Effects.Buttons.MouseOut(this);" onclick="Core.Panel.Controls.Settings.ListThemes();">Settings</td><td width="33%" class="Button" onMouseOver="Core.Effects.Buttons.MouseOver(this);" onMouseOut="Core.Effects.Buttons.MouseOut(this);" onclick="Core.Panel.Controls.Uploader.ShowUploader();">Upload File</td><td width="33%" class="Button" onMouseOver="Core.Effects.Buttons.MouseOver(this);" onMouseOut="Core.Effects.Buttons.MouseOut(this);" onclick="Core.Session.DoLogout();">Logout</td></tr><tr><td id="Panel-Contents-Inner" colspan="3"></td></tr><tr style="height:12px;"><td colspan="3" class="Button" onMouseOver="Core.Effects.Buttons.MouseOver(this);" onMouseOut="Core.Effects.Buttons.MouseOut(this);" onclick="Core.Panel.Controls.About();">About Novis</td></tr></table></div>'),
		Position:0,
		PreviousText:"",
		Move:function(Position, Contents)
			{
				if (Position==2)
				{
					if (Core.Panel.Position==2)
					{
						Core.Panel.Move(1);
						return;
					}
					document.getElementById("Panel").style.visibility="visible";
					if (Contents==undefined)
					{
						Contents=document.getElementById("Panel-Contents").innerHTML;
					}
					else {Core.Panel.PreviousText=document.getElementById("Panel-Contents").innerHTML;}
					document.getElementById("Panel-Contents").innerHTML=Contents;
					document.getElementById("Desktop").style.visibility="hidden";
					document.getElementById("Panel").style.width=Core.Environment.Width-64+"px";
					document.getElementById("Panel-Button").style.left=Core.Environment.Width-64+"px";
					document.getElementById("Panel-Apps").style.left=Core.Environment.Width-64+"px";
					Core.Panel.Position=2;
				}
				else if (Position==1 || (Position==undefined && Core.Panel.Position==0))
				{
					document.getElementById("Panel").style.visibility="visible";
					if (Contents==undefined)
					{
						Contents=document.getElementById("Panel-Contents").innerHTML;
					}
					else {Core.Panel.PreviousText=document.getElementById("Panel-Contents").innerHTML;}
					document.getElementById("Panel-Contents").innerHTML=Contents;
					document.getElementById("Desktop").style.visibility="visible";
					document.getElementById("Panel").style.width="436px";
					document.getElementById("Panel-Button").style.left="436px";
					document.getElementById("Panel-Apps").style.left="436px";
					document.getElementById("Desktop").style.left="500px";
					Core.Panel.Position=1;
				}
				else if (Position==0 || (Position==undefined))
				{
					if (Contents==undefined)
					{
						Contents=document.getElementById("Panel-Contents").innerHTML;
					}
					else {Core.Panel.PreviousText=document.getElementById("Panel-Contents").innerHTML;}
					document.getElementById("Panel-Contents").innerHTML=Contents;
					document.getElementById("Panel").style.width="436px";
					document.getElementById("Panel").style.visibility="hidden";
					document.getElementById("Desktop").style.visibility="visible";
					document.getElementById("Panel-Button").style.left="0px";
					document.getElementById("Panel-Apps").style.left="0px";
					document.getElementById("Desktop").style.left="64px";
					Core.Panel.Position=0;
				}
				Core.FileSystem.RealignDirItems("Desktop");
			},
		Modify:function(Text)
			{
				if (Text==undefined)
				{
					Text=document.getElementById("Panel-Contents").innerHTML;
				}
				Core.Panel.PreviousText=document.getElementById("Panel-Contents").innerHTML;
				document.getElementById("Panel-Contents").innerHTML=Text;
			}
	},
	Session:{
		Username:"",
		Desktop:"",
		ClosePrompt:false,
		DoLogin:function(Username,Password)
			{
				Core.ServerCall("novis/session.php?action=login","username="+Username+"&password="+Password,function(Data){if (Data.Status==202){
						//Set Side Panel
						Core.Panel.Modify(Core.Panel.DefaultText[0]);
						document.getElementById("Panel-Username").innerHTML=Data.Text.toUpperCase();
						//Set Basic User Information
						Core.Session.Username=Data.Text;
						Core.Session.Desktop="users/"+Data.Text+"/desktop/";
						Core.Session.ClosePrompt=true;
						//Update File Extensions
						Core.FileSystem.UpdateExt();
						//Set Theme
						Core.ServerCall("novis/desktop.php?action=settings","name=theme&type=read",function(Data){if (Data.Status==200){Core.Effects.ChangeTheme(Data.Text);}});
						//Get Desktop Icons
						Core.Desktop.GetDesktop();
						Core.Desktop.GetPanelApps();
						} else if(Data.Status==401) {alert("Incorrect Username or Password!");
						} else {alert("A "+Data.Status+" error has occured while trying to login!");}});
			},
		DoNewUser:function(Username,Password)
			{
				Core.ServerCall("novis/session.php?action=new","username="+Username+"&password="+Password,function(Data){if (Data.Status==204){
						alert("User has been created! You can now login!");
						} else if(Data.Status==409) {alert("That Username is taken! Please enter another!");
						} else {alert("A "+Data.Status+" error has occured while trying to create a new user!");}});
			},
		DoLogout:function()
			{
				if (confirm("Are you sure you want to logout of Novis? Any unsaved work will be purged!"))
				{
				Core.ServerCall("novis/session.php?action=logout","",function(Data) {if (Data.Status==204){
						Core.Session.ClosePrompt=false; location.href=location.href;
						} else {alert("A "+Data.Status+" error has occured while trying to logout!");}});
				}
			}
	},
	Desktop:{
		Time:{
			ShowTime:function()
				{
					//NOT YET IMPLEMENTED!
					//NewTimeDiv.id="Desktop-Time";
					//document.body.appendChild(NewTimeDiv);
				},
		},
		ContextDisplay:false,
		AllowContextChange:true,
		GetDesktop:function()
			{
				Core.FileSystem.GetDirectory("users/"+Core.Session.Username+"/desktop/","Desktop");
			},
		GetPanelApps:function()
			{
				//TODO: Finish Panel Apps etc
			},
		Refresh:function()
			{
				Core.FileSystem.RefreshDirectory("users/"+Core.Session.Username+"/desktop/","Desktop");
			},
		ContextMenu:function(ContextItem,Extension)
			{
				//TODO: Complete Overhal of Context Menu (use array dumps instead, associate with file types, get rid of messy code)
				//		Try to integrate before version 1.
				
				//Note: setTimeout() is a quick fix solution to stop the desktop context menu when right clicking on a desktop item
				
				if (Core.Desktop.AllowContextChange==false) {return;}
				if (Core.Desktop.ContextDisplay)
				{
					Core.Desktop.ContextDisplay=false;
					document.body.removeChild(document.getElementById("ContextMenu"));
				}
				if (ContextItem==undefined) {return;}
				var ContextMenu = document.createElement("div");
				ContextMenu.id="ContextMenu";
				ContextMenu.style.position="absolute";
				ContextMenu.className="ContextMenu"
				ContextMenu.style.border="thin solid #000000";
				ContextMenu.style.zIndex="256";
				ContextMenu.style.overFlow="hidden";
				ContextMenu.style.left=Core.Environment.MouseX+"px";
				ContextMenu.style.top=Core.Environment.MouseY+"px";
				ContextMenu.style.width="120px";
				if (Core.Environment.MouseX+121>Core.Environment.Width)
				{
					ContextMenu.style.left=Core.Environment.MouseX-(Core.Environment.MouseX+121-Core.Environment.Width)+"px";
				}
				
				if (ContextItem=="Desktop")
				{
				ContextMenu.innerHTML='<div style="text-align:center;" id="ContextMenu-Item-2" onclick="Core.Desktop.Refresh(); Core.Desktop.ContextMenu();" onmouseover="this.className=\'Button-Highlight\'" onmouseout="this.className=\'Button\'">Refresh</div><div style="text-align:center;" id="ContextMenu-Item-3" onclick="/*Insert About Code*/ Core.Desktop.ContextMenu();" onmouseover="this.className=\'Button-Highlight\'" onmouseout="this.className=\'Button\'">About Novis</div>';
				}
				else if (ContextItem.indexOf("-Directory")!=-1)
				{
				ContextMenu.innerHTML='<div style="text-align:center;" id="ContextMenu-Item-1" onclick="/*Insert Up Code*/ Core.Desktop.ContextMenu();" onmouseover="this.className=\'Button-Highlight\'" onmouseout="this.className=\'Button\'">Up</div><div style="text-align:center;" id="ContextMenu-Item-2" onclick="Core.Desktop.Refresh(); Core.Desktop.ContextMenu();" onmouseover="this.className=\'Button-Highlight\'" onmouseout="this.className=\'Button\'">Refresh</div><div style="text-align:center;" id="ContextMenu-Item-3" onclick="/*Insert Properties Code*/ Core.Desktop.ContextMenu();" onmouseover="this.className=\'Button-Highlight\'" onmouseout="this.className=\'Button\'">Properties</div>';
				}
				else
				{
				ContextMenu.innerHTML='<div style="text-align:center;" id="ContextMenu-Item-1" onclick="Core.FileSystem.OnOpen(\''+ContextItem+'\',\''+Extension+'\'); Core.Desktop.ContextMenu();" onmouseover="this.className=\'Button-Highlight\'" onmouseout="this.className=\'Button\'">Open</div><div style="text-align:center;" id="ContextMenu-Item-2" onclick="/*Insert Copy Code*/ Core.Desktop.ContextMenu();" onmouseover="this.className=\'Button-Highlight\'" onmouseout="this.className=\'Button\'">Copy</div><div style="text-align:center;" id="ContextMenu-Item-3" onclick="/*Insert Paste Code*/ Core.Desktop.ContextMenu();" onmouseover="this.className=\'Button-Highlight\'" onmouseout="this.className=\'Button\'">Paste</div><div style="text-align:center;" id="ContextMenu-Item-4" onclick="Core.Desktop.Refresh(); Core.Desktop.ContextMenu();" onmouseover="this.className=\'Button-Highlight\'" onmouseout="this.className=\'Button\'">Refresh</div><div style="text-align:center;" id="ContextMenu-Item-4" onclick="/*Insert Properties Code*/ Core.Desktop.ContextMenu();" onmouseover="this.className=\'Button-Highlight\'" onmouseout="this.className=\'Button\'">Properties</div>';
				}
				Core.Desktop.ContextDisplay=true;
				document.body.appendChild(ContextMenu);
				Core.Desktop.AllowContextChange=false;
				setTimeout("Core.Desktop.AllowContextChange=true;",100);
			}
	},
	FileSystem:{
		Extensions:new Array(),
		GlobalExtension:new Array(),
		//Move to API and reduce code (see FileExtImg)
		OpenFile:function(ElementID,FileType)
			{
				//PLUGGED
				//DOESNT REQUIRE FileType ANYMORE
				API.Shell.Open(document.getElementById(ElementID).getElementsByTagName("form")[0].firstChild.value,new Array(document.getElementById(ElementID).getElementsByTagName("form")[0].firstChild.value));
			},
		//Move to API
		OpenSelection:function()
			{
				for (var i = 0; i < Windows.SelectedItems.length; i++)
				{
					if (Windows.SelectedItems[i][0]!=null)
					{
						//Doesnt require the filetype anymore but im leaving it in incase i revert which i doubt i will
						Core.FileSystem.OpenFile(Windows.SelectedItems[i][0],document.getElementById(Windows.SelectedItems[i][0]).name);
					}
				}
			},
		//Move to API
		GetFile:function(Path,ReturnTo)
			{
				Core.ServerCall("novis/desktop.php?action=get","path="+escape(Path),ReturnTo);
			},
		//Move to API
		GetDirectory:function(Path,ElementID)
			{
				Core.ServerCall("novis/desktop.php?action=get","path="+escape(Path),function(Data){if (Data.Status==200){Core.FileSystem.DirectoryBuilder(ElementID,Data.Text);}else{alert("A "+Data.Status+" error has occured while trying to retrieve directory \""+Path+"\"!");}});
			},
		DirectoryBuilder:function(ElementID,UnderivedItems)
			{
				//Clean up code
				if (document.getElementById(ElementID)==null) {return;}
				if (document.getElementById(ElementID).innerHTML!="") {document.getElementById(ElementID).innerHTML="";}
				var Row = 0;
				var Col = 0;
				var MaxRows = 0;
				var MaxCols = 0;
				
				if (document.getElementById(ElementID).style.right!="")
				{
					var width=Core.Environment.Width-parseInt(document.getElementById(ElementID).style.left)-parseInt(document.getElementById(ElementID).style.right);
				}
				else
				{
					var width=parseInt(document.getElementById(ElementID).style.width);
				}
				MaxCols=Math.floor(width/96);
				
				if (document.getElementById(ElementID).style.bottom!="")
				{
					var height=Core.Environment.Height-parseInt(document.getElementById(ElementID).style.top)-parseInt(document.getElementById(ElementID).style.bottom);
				}
				else
				{
					var height=parseInt(document.getElementById(ElementID).style.height);
				}
				MaxRows=Math.floor(height/96);
				
				var ItemArray = UnderivedItems.split("|");
				for(var i=1; i<ItemArray.length; i+=4)
				{
					var NewItem = document.createElement("div");
					NewItem.align="center";
					NewItem.id=ElementID+'-Item-'+Math.ceil(i/4);
					NewItem.onmousedown=function(event) {Windows.SelectItem(this.id,event);}
					NewItem.oncontextmenu=function() {Core.Desktop.ContextMenu(this.id,this.name);}
					NewItem.ondblclick=function() {Core.FileSystem.OpenSelection();}
					NewItem.onmouseover=function() {this.className="Icon-Highlight";}
					NewItem.onmouseout=function() {this.className="Icon";}
					NewItem.style.verticalAlign="middle";
					//NewItem.title=ItemArray[i+1];
					NewItem.title="Path: "+ItemArray[i+1]+"\r\n"+"Type: "+ItemArray[i+3]+"\r\n"+"Date Modified: ";
					NewItem.name=ItemArray[i+3];
					NewItem.style.border="thin none #AABBCC";
					NewItem.style.position="absolute";
					NewItem.style.left=Col*96+"px";
					NewItem.style.top=Row*96+"px";
					NewItem.style.width="96px";
					NewItem.style.height="96px";
					NewItem.style.overflow="hidden";
					if (ItemArray[i]=="D") { var imgsrc="novis/images/32/places/folder.png"; }
					if (ItemArray[i]=="F") { var imgsrc=Core.FileSystem.FileExtImg(ItemArray[i+3]); }
					NewItem.innerHTML='<br /><img src="'+imgsrc+'" /><br />'+ItemArray[i+2]+'<form name="settings"><input type="hidden" id="path" value="'+ItemArray[i+1]+'" /><input type="hidden" id="extension" value="'+ItemArray[i+3]+'" /></form>';
					document.getElementById(ElementID).appendChild(NewItem);
					Col++;
					if (Col==MaxCols)
					{
						Col=0;
						Row++;
					}
				}
			},
		RefreshDirectory:function(Path,ElementID)
			{
				//Look into a cleaner looking method of refreshing a directory AND MOVE TO API!
				document.getElementById(ElementID).innerHTML="";
				Core.FileSystem.GetDirectory(Path,ElementID);
			},
		RealignDirItems:function(ElementID)
			{
				//Clean up code
				if (document.getElementById(ElementID)==null) {return;}
				var Row = 0;
				var Col = 0;
				var MaxRows = 0;
				var MaxCols = 0;
				
				if (document.getElementById(ElementID).style.right!="")
				{
					var width=Core.Environment.Width-parseInt(document.getElementById(ElementID).style.left)-parseInt(document.getElementById(ElementID).style.right);
				}
				else
				{
					var width=parseInt(document.getElementById(ElementID).style.width);
				}
				MaxCols=Math.floor(width/96);
				
				if (document.getElementById(ElementID).style.bottom!="")
				{
					var height=Core.Environment.Height-parseInt(document.getElementById(ElementID).style.top)-parseInt(document.getElementById(ElementID).style.bottom);
				}
				else
				{
					var height=parseInt(document.getElementById(ElementID).style.height);
				}
				MaxRows=Math.floor(height/96);
				
				for (var i = 0; i<document.getElementById(ElementID).getElementsByTagName("div").length; i++)
				{
					document.getElementById(ElementID).getElementsByTagName("div")[i].style.left=Col*96+"px";
					document.getElementById(ElementID).getElementsByTagName("div")[i].style.top=Row*96+"px";
					
					Col++;
					if (Col==MaxCols)
					{
						Col=0;
						Row++;
					}
				}
			},
		GetExtensionInfo:function(FileType)
			{
				//Loops through local account file extensions
				for (var i = 1; i < Core.FileSystem.Extensions.length; i+=3)
				{
					if (Core.FileSystem.Extensions[i]==FileType) return new Array(Core.FileSystem.Extensions[i],Core.FileSystem.Extensions[i+1],Core.FileSystem.Extensions[i+2]);
				}
				return false;
			},
		//Make single function for extraction Extension Data (maybe return mini array of extension (extension,icon,path) back to application)
		//also consider moving entire function into where it is used (as it is only used by one function)
		FileExtImg:function(FileType)
			{
				var extInfo=Core.FileSystem.GetExtensionInfo(FileType);
				if (extInfo!=false)
				{
					return extInfo[1];
				}
				return "novis/images/32/mimetypes/text-x-generic-template.png";
			},
		//Useful but rename, move to API and needs to update global extensions
		UpdateExt:function()
			{
				Core.ServerCall("novis/desktop.php?action=syssettings","name=filetype&type=read",function(Data){if (Data.Status==200){
						Core.FileSystem.Extensions=Data.Text.split("|");
						}else{alert("A "+Data.Status+" error has occured while trying to update client-side file associations!");}});
			},
	},
	Environment:{
		MouseX:0,
		MouseY:0,
		OldMouseX:0,
		OldMouseY:0,
		Width:0,
		Height:0,
		Resize:function()
			{
				Core.Environment.Width=window.innerWidth;
				Core.Environment.Height=window.innerHeight;
				if (Core.Session.Username!="")
				Core.FileSystem.RealignDirItems("Desktop");
			}
	}
}

//Startup Settings
Core.Environment.Resize();
document.onmousemove=function(e) {Core.Environment.MouseX = e.clientX; Core.Environment.MouseY = e.clientY;
if (Windows.ResizeID!=null)
{
	if (document.getElementById(Windows.ResizeID).style.width=="100%"){return;}
	document.getElementById(Windows.ResizeID).style.opacity=0.5;
	var NewWidth=(Core.Environment.MouseX-Core.Environment.OldMouseX)+parseInt(document.getElementById(Windows.ResizeID).style.width);
	var NewHeight=(Core.Environment.MouseY-Core.Environment.OldMouseY)+parseInt(document.getElementById(Windows.ResizeID).style.height);
	if (NewHeight>80 && NewHeight>Windows.Windows[API.Misc.GetIdFromElement(Windows.ResizeID)].MinHeight)
	{
		Core.Environment.OldMouseY=Core.Environment.MouseY;
		document.getElementById(Windows.ResizeID).style.height=NewHeight+"px";
		document.getElementById(Windows.ResizeID+"-Inner").style.height=NewHeight-24+"px";
	}
	if (NewWidth>160 && NewWidth>Windows.Windows[API.Misc.GetIdFromElement(Windows.ResizeID)].MinWidth)
	{
		Core.Environment.OldMouseX=Core.Environment.MouseX;
		document.getElementById(Windows.ResizeID).style.width=NewWidth+"px";
		document.getElementById(Windows.ResizeID+"-Inner").style.width=NewWidth+"px";
	}
	if (Apps[API.Misc.GetIdFromElement(Windows.ResizeID)].OnResize!=null) {Apps[API.Misc.GetIdFromElement(Windows.ResizeID)].OnResize();}
}
if (Windows.MoveID!=null)
{
	if (document.getElementById(Windows.MoveID).style.width=="100%"){return;}
	document.getElementById(Windows.MoveID).style.opacity=0.5;
	var NewX=(Core.Environment.MouseX-Core.Environment.OldMouseX)+parseInt(document.getElementById(Windows.MoveID).style.left);
	var NewY=(Core.Environment.MouseY-Core.Environment.OldMouseY)+parseInt(document.getElementById(Windows.MoveID).style.top);
	Core.Environment.OldMouseY=Core.Environment.MouseY;
	document.getElementById(Windows.MoveID).style.left=NewX+"px";
	Core.Environment.OldMouseX=Core.Environment.MouseX;
	document.getElementById(Windows.MoveID).style.top=NewY+"px";
	if (Apps[API.Misc.GetIdFromElement(Windows.MoveID)].OnMove!=null) {Apps[API.Misc.GetIdFromElement(Windows.MoveID)].OnMove();}
}}
document.onmouseup=function() {Windows.ResetResize(); Windows.ResetMove();}
