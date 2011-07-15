Name::Novis File Browser
Version::1.0
CreatedBy::James Turner
Company::Turner Software
Website::http://www.turnersoftware.au.com
Code::={
	OnLaunch:function(Arguments)
	{
		this.MainWin = new Core.Applications.Window(100,100,500,300,AppID);
		Core.API.Windows.AllowResize(this.MainWin["Id"],false);
		this.MainWin["LinkWithApp"]=true;
		this.MainWin["AllowMaximise"]=false;
		this.MainWin["AllowMinimise"]=true;
		//May need to parse the arguments path first.
		this.Description = Arguments;
		Core.Menu.ChangeItemImage(this.MainWin["Id"],"index.php?action=fs-get&type=themes&path="+escape("default/22/places/folder.png"));
		Core.API.Windows.Title(this.MainWin["Id"],"File Browser - "+this.Description);
		Core.API.Windows.Icon(this.MainWin["Id"],"index.php?action=fs-get&type=themes&path="+escape("default/22/places/folder.png"));
		Core.API.Windows.InnerText(this.MainWin["Id"],"<div style='position:relative; background-color:#AA22FF; top:20px; width:100%;'>abc</div>");
	},
	OpenDir:function()
	{
		
	},
}