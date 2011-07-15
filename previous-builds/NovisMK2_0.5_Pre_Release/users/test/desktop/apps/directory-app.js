={
	Init:function()
		{
			//Startup Settings
			this.loaded=false;
			this.path="";
			if (Windows.Windows[AppID].Args!=undefined)
			{
				this.path = API.Misc.DirectoryReady(Windows.Windows[AppID].Args[0]);
			}
			else
			{
				this.path = Core.Session.Desktop;
			}
			API.Application.ChangeTitle(AppID,"File Browser - "+this.path);
			API.Application.ChangeIcon(AppID,"apps/preferences-system-windows.png");
			API.Application.Maximise(AppID);
			this.inner = document.getElementById("Window-"+AppID+"-Inner");
			this.DirCode = API.Widgets.Add.DirectoryElement("Window-"+AppID+"-Inner-DirectoryElement",0,48,this.inner.style.width,parseInt(this.inner.style.height)-24);
			document.getElementById("Window-"+AppID+"-Inner").innerHTML=this.DirCode;
			
			//Directory Controls - NEED TO REDESIGN DIRECTORY CONTROLS!
			var Prompter = document.createElement("div");
			//Prompter.style.position="absolute";
			if (Windows.Windows[AppID].Maximised)
			{
				Prompter.style.width=parseInt(Core.Environment.Width)+"px";
			}
			else
			{
				Prompter.style.width=parseInt(document.getElementById("Window-"+AppID).style.width)-2+"px";
			}
			Prompter.style.height="23px";
			Prompter.style.overflow="hidden";
			Prompter.style.backgroundColor="#FFFFFF";
			Prompter.id=this.DirElement+'-Controls';
			Prompter.innerHTML='<form onsubmit="Apps['+AppID+'].ChangeDirectory(); return false;">Path: <input size="55" type="text" id="Window-'+AppID+'-Inner-DirectoryElement-Controls-Path" value="'+this.path+'"> <input type="submit" value="->"></form>';
			document.getElementById("Window-"+AppID+"-Inner").appendChild(Prompter);
			
			//Quick Resize Fix
			this.loaded=true;
			Apps[AppID].OnResize();
			API.Widgets.Change.DirectoryPath("Window-"+AppID+"-Inner-DirectoryElement",this.path);
		},
	OnResize:function()
		{
			if (this.loaded)
			{
				//Resize Directory Holder
				document.getElementById("Window-"+AppID+"-Inner-DirectoryElement").style.width=this.inner.style.width;
				document.getElementById("Window-"+AppID+"-Inner-DirectoryElement").style.height=parseInt(this.inner.style.height)-24+"px";
				API.FileSystem.RealignDirItems("Window-"+AppID+"-Inner-DirectoryElement");
			}
		},
	ChangeDirectory:function()
		{
			var dir = document.getElementById("Window-"+AppID+"-Inner-DirectoryElement"+'-Controls-Path').value;
			dir = API.Misc.DirectoryReady(dir);
			this.path=dir;
			document.getElementById("Window-"+AppID+"-Inner-DirectoryElement"+'-Controls-Path').value = dir;
			API.Application.ChangeTitle(AppID,"File Browser - "+dir);
			API.Widgets.Change.DirectoryPath("Window-"+AppID+"-Inner-DirectoryElement",dir);
		},
	OnMultiLaunch:function(Arguments)
		{
			if (Arguments!=null && Arguments!=undefined)
			{
				var path = API.Misc.DirectoryReady(Arguments[0]);
				document.getElementById("Window-"+AppID+"-Inner-DirectoryElement"+'-Controls-Path').value=path;
				API.Application.ChangeTitle(AppID,"File Browser - "+path);
				API.Widgets.Change.DirectoryPath("Window-"+AppID+"-Inner-DirectoryElement",path);
			}
		},
}