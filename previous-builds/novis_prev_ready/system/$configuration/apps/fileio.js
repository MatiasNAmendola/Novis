Name::Novis File Save-Open Dialog
Version::1.0
CreatedBy::James Turner
Company::Turner Software
Website::http://www.turnersoftware.au.com
Code::={
	OnLaunch:function(Arguments)
	{
		//Argument Map
		//Method - Type - Name/Contents - Launch App ID - Async Return Method
		this.MainWin = new Core.Applications.Window(80,80,500,400,AppID);
		this.MainWin["AllowMaximise"]=false;
		this.MainWin["AllowMinimise"]=false;
		this.MainWin["AllowClose"]=false;
		Core.API.Windows.AllowResize(this.MainWin["Id"],false);
		this.Arguments = Core.Parse.BreakApartChunks(Arguments);
		this.Description = "";
		this.Text = "";
		this.FileName = this.Arguments[0][2];
		Core.API.Windows.Title(this.MainWin["Id"],this.Arguments[0][0]+" "+this.Arguments[0][1]+"...");
		Core.API.Windows.Icon(this.MainWin["Id"],"index.php?action=fs-get&type=themes&path="+escape("default/22/categories/applications-system.png"));
		Core.API.Windows.InnerText(this.MainWin["Id"],'TEST');
		this.GetDirContents("system");
	},
	GetDirContents:function()
	{
		//Core.ServerCall.SendRequest("index.php?action=fs-get&encode=true&type=&path="+escape(this.Arguments),"",function(Data){Core.Applications.Applications[AppID].Saved=true; Core.Applications.Applications[AppID].SetText(Data); if(Data==null){alert("If the text displayed is not what you expected, you may not have permission to access this resource!");}});
	},
	AsyncReturn:function()
	{
		if (Core.Applications.Applications[this.Arguments[0][3]]!=null)
		{
			try
			{
				var result='['+this.Arguments[0][0]+'|'+this.FileName+'|'+this.Text+']';
				eval("Core.Applications.Applications["+this.Arguments[0][3]+"]."+this.Arguments[0][4]+"("+result+");");
			}
			catch(e)
			{
				Core.Desktop.ThrowError("An error occured while trying to communicate to launch application!");
			}
		}
		Core.Applications.CloseApplication(AppID,true);
	},
}