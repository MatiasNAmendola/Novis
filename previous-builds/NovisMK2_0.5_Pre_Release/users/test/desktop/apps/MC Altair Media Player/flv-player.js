={
	Init:function()
		{
			//Resize Fix
			this.loaded=false;
			//Set Application Stuff
			API.Application.ChangeSize(AppID,522,300);
			API.Application.SetMin(AppID,522,300);
			API.Application.ChangeTitle(AppID,"MC Altair Media Player");
			API.Application.ChangeIcon(AppID,"mimetypes/audio-x-generic.png");
			//Get Flash Path
			var path = API.Misc.WindowObject(AppID).App;
			path = path.substring(0,path.lastIndexOf("/")+1)+'mcmp.swf';
			Apps[AppID].playerFile = "novis/desktop.php?action=load&path="+path;
			//Set Other Settings
			fpFileURL = "desktop.php?action=load&path="+Windows.Windows[AppID].Args[0];
			//Make Object
			Apps[AppID].MakeObject(parseInt(document.getElementById("Window-"+AppID+"-Inner").style.width),parseInt(document.getElementById("Window-"+AppID+"-Inner").style.height)-18,Apps[AppID].playerFile,fpFileURL,Windows.Windows[AppID].Args[0]);
			this.loaded=true;
		},
	MakeObject:function(width,height,player,vars,filepath)
		{
			//Builds the Media Player HTML Code
			str='<object style="z-index:0;" id="Window-'+AppID+'-Inner-VideoObj" width="'+width+'px" height="'+height+'px" data="'+player+'" type="application\/x-shockwave-flash">';
			str+='<param name="movie" value="'+player+'">';
			str+='<param name="allowScriptAccess" value="always">';
			str+='<param name="quality" value="high">';
			str+='<param name="allowFullScreen" value="true">';
			str+='<param name="wmode" value="transparent">';
			str+='<param id="Window-'+AppID+'-Inner-FlashVars" name="FlashVars" value="fpFileURL='+escape(vars)+'">';
			str+='<\/object><br />File: <span id="Window-'+AppID+'-Inner-Path" title="'+filepath+'">'+filepath+"</span>";
			document.getElementById("Window-"+AppID+"-Inner").innerHTML=str;
		},
	OnResize:function()
		{
			if (this.loaded)
			{
				var obj=document.getElementById("Window-"+AppID+"-Inner-VideoObj");
				obj.width=document.getElementById("Window-"+AppID+"-Inner").style.width;
				obj.height=parseInt(document.getElementById("Window-"+AppID+"-Inner").style.height)-18+"px";
			}
		},
	OnMultiLaunch:function(Arguments)
		{
			//Instead of reloading the player, it changes the flash vars
			//I may remove it later on
			//document.getElementById("Window-"+AppID+"-Inner-Path").innerHTML=Arguments[0];
			//document.getElementById('Window-'+AppID+'-Inner-FlashVars').value='fpFileURL='+escape("desktop.php?path="+Arguments[0]);
			document.getElementById("Window-"+AppID+"-Inner").innerHTML="";
			Apps[AppID].MakeObject(parseInt(document.getElementById("Window-"+AppID+"-Inner").style.width),parseInt(document.getElementById("Window-"+AppID+"-Inner").style.height)-18,Apps[AppID].playerFile,"desktop.php?action=load&path="+Arguments[0],Arguments[0]);
		},
}