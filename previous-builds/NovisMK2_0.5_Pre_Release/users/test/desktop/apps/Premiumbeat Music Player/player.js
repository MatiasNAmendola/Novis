={
	Init:function()
		{
			//NOTE: Premiumbeat have agreed use of the Single Track Flash MP3 Player with Novis
			//		The Single Track Flash Media Player (playerSingle.swf) is sole property of Premiumbeat
			//		Visit www.premiumbeat.com for more information about the product!
			//Resize Fix
			this.loaded=false;
			//Set Application Stuff
			API.Application.ChangeSize(AppID,250,90+24+18);
			API.Application.SetMin(AppID,250,90+24+18);
			API.Application.ChangeTitle(AppID,"Premiumbeat Music Player");
			API.Application.ChangeIcon(AppID,"mimetypes/audio-x-generic.png");
			//Get Flash Path
			var path = API.Misc.WindowObject(AppID).App;
			path = path.substring(0,path.lastIndexOf("/")+1)+'playerSingle.swf';
			Apps[AppID].playerFile = "novis/desktop.php?action=load&path="+path;
			//Set Other Settings
			FileURL = "novis/desktop.php?action=load&path="+Windows.Windows[AppID].Args[0];
			//Make Object
			Apps[AppID].MakeObject(parseInt(document.getElementById("Window-"+AppID+"-Inner").style.width),parseInt(document.getElementById("Window-"+AppID+"-Inner").style.height)-18,Apps[AppID].playerFile,FileURL,Windows.Windows[AppID].Args[0]);
			this.loaded=true;
		},
	MakeObject:function(width,height,player,sound,filepath)
		{
			//Builds the Music Player HTML Code
			str='<object style="z-index:0;" id="Window-'+AppID+'-Inner-MusicObj" width="'+width+'px" height="'+height+'px" data="'+player+'" type="application\/x-shockwave-flash">';
			//str+='<param name="movie" value="'+player+'">';
			str+='<param name="allowScriptAccess" value="always">';
			str+='<param name="quality" value="high">';
			str+='<param name="allowFullScreen" value="true">';
			str+='<param name="wmode" value="transparent">';
			str+='<param id="Window-'+AppID+'-Inner-FlashVars" name="flashvars" value="autoPlay=yes&soundPath='+escape(sound)+'">';
			str+='<\/object><br />File: <span id="Window-'+AppID+'-Inner-Path" title="'+filepath+'">'+filepath+"</span>";
			document.getElementById("Window-"+AppID+"-Inner").innerHTML=str;
		},
	OnResize:function()
		{
			if (this.loaded)
			{
				var obj=document.getElementById("Window-"+AppID+"-Inner-MusicObj");
				obj.width=document.getElementById("Window-"+AppID+"-Inner").style.width;
				obj.height=parseInt(document.getElementById("Window-"+AppID+"-Inner").style.height)-18+"px";
			}
		},
	OnMultiLaunch:function(Arguments)
		{
			//Instead of reloading the player, it changes the flash vars
			//I may remove it later on
			//document.getElementById("Window-"+AppID+"-Inner-Path").innerHTML=Arguments[0];
			//document.getElementById('Window-'+AppID+'-Inner-FlashVars').value='autoPlay=yes&soundPath='+escape("desktop.php?path="+Arguments[0]);
			document.getElementById("Window-"+AppID+"-Inner").innerHTML="";
			Apps[AppID].MakeObject(parseInt(document.getElementById("Window-"+AppID+"-Inner").style.width),parseInt(document.getElementById("Window-"+AppID+"-Inner").style.height)-18,Apps[AppID].playerFile,"novis/desktop.php?action=load&path="+Arguments[0],Arguments[0]);
		},
}