Name::Novis Sound Manager
Version::1.0
CreatedBy::James Turner
Company::Turner Software
Website::http://www.turnersoftware.au.com
Code::={
	OnLaunch:function(Arguments)
	{
		this.MainWin = new Core.Applications.Window(80,80,250,100,AppID);
		Core.API.Windows.AllowResize(this.MainWin["Id"],false);
		this.MainWin["LinkWithApp"]=true;
		this.MainWin["AllowMaximise"]=false;
		this.MainWin["AllowMinimise"]=true;
		this.currentIcon = Core.Sound.GetAudioIcon();
		Core.Menu.ChangeItemImage(this.MainWin["Id"],"index.php?action=fs-get&type=themes&path="+escape("default/22/status/"+this.currentIcon));
		Core.API.Windows.Title(this.MainWin["Id"],"Sound Manager");
		Core.API.Windows.Icon(this.MainWin["Id"],"index.php?action=fs-get&type=themes&path="+escape("default/22/status/"+this.currentIcon));
		Core.API.Windows.InnerText(this.MainWin["Id"],"<div style='text-align:center;'>Master Volume</div>"+Core.Controls.TrackBar.CreateNew("SoundMan-"+AppID+"-MVolume-TrackBar",200)+"<div style='text-align:center;'><input type='button' value='Test' onclick='Core.Applications.Applications["+AppID+"].TestSound();' /></div>");
		Core.Controls.TrackBar.SetMoveEventHandler("SoundMan-"+AppID+"-MVolume-TrackBar",Core.Applications.Applications[AppID].SetMasterVolume);
		Core.Controls.TrackBar.SetPercent("SoundMan-"+AppID+"-MVolume-TrackBar",Core.Sound.MasterVolume);
	},
	SetMasterVolume:function(Vol)
	{
		Core.Sound.SetMasterVolume(Vol);
		Core.Applications.Applications[AppID].SetIcons();
	},
	SetIcons:function()
	{
		var icon = Core.Sound.GetAudioIcon();
		if (icon==this.currentIcon){return;}
		Core.Menu.ChangeItemImage(this.MainWin["Id"],"index.php?action=fs-get&type=themes&path="+escape("default/22/status/"+icon));
		Core.API.Windows.Icon(this.MainWin["Id"],"index.php?action=fs-get&type=themes&path="+escape("default/22/status/"+icon));
		this.currentIcon = icon;
	},
	TestSound:function()
	{
		Core.Sound.SimplyPlay("index.php?action=fs-get&type=sound&path=login.ogg",100);
	},
}