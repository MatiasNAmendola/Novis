Name::Novis Launcher
Version::1.0
CreatedBy::James Turner
Company::Turner Software
Website::http://www.turnersoftware.au.com
Code::={
	OnLaunch:function(Arguments)
	{
		if (Arguments!="")
		{
			Core.Applications.Run(Arguments,"","");
			Core.Applications.CloseApplication(AppID,true);
			return;
		}
		this.MainWin = new Core.Applications.Window(80,80,250,117,AppID);
		Core.API.Windows.AllowResize(this.MainWin["Id"],false);
		this.MainWin["LinkWithApp"]=true;
		this.MainWin["AllowMaximise"]=false;
		this.MainWin["AllowMinimise"]=false;
		Core.Menu.ChangeItemImage(this.MainWin["Id"],"index.php?action=fs-get&type=themes&path="+escape("default/22/places/start-here.png"));
		Core.API.Windows.Title(this.MainWin["Id"],"Application Launcher");
		Core.API.Windows.Icon(this.MainWin["Id"],"index.php?action=fs-get&type=themes&path="+escape("default/22/places/start-here.png"));
		Core.API.Windows.InnerText(this.MainWin["Id"],'Application Path<br /><input id="AppLaunchPath" type="text" style="width:100%; background-color:#EEEEEE; border-width:0;" /><br />Arguments<br /><input id="AppLaunchArgs" type="text" style="width:100%; background-color:#EEEEEE; border-width:0;" /><br /><input type="button" value="Launch!" onclick="Core.Applications.Applications['+AppID+'].Launch();" />');
	},
	Launch:function()
	{
		Core.Applications.Run(document.getElementById("AppLaunchPath").value,"",document.getElementById("AppLaunchArgs").value);
	},
}