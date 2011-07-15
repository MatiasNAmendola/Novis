Name::Novis Text Editor
Version::1.0
CreatedBy::James Turner
Company::Turner Software
Website::http://www.turnersoftware.au.com
Code::={
	OnLaunch:function(Arguments)
	{
		this.MainWin = new Core.Applications.Window(30,30,300,300,AppID);
		this.Saved = false;
		this.Arguments = Arguments;
		this.Description = Arguments;
		this.MainWin["LinkWithApp"]=true;
		Core.API.Windows.Title(this.MainWin["Id"],"Text Editor");
		Core.API.Windows.Icon(this.MainWin["Id"],"index.php?action=fs-get&type=themes&path="+escape("default/22/apps/accessories-text-editor.png"));
		Core.API.Windows.InnerText(this.MainWin["Id"],'<div style="position:relative; left:0px; top:0px; height:5px; width:100%;"><img onclick="//Add Content Here" src="index.php?action=fs-get&type=themes&path=default/22/actions/document-new.png" title="New" /><img onclick="Core.Applications.Applications['+AppID+'].Load();" src="index.php?action=fs-get&type=themes&path=default/22/actions/view-refresh.png" title="Reload" /><img onclick="Core.Applications.Applications['+AppID+'].Save();" src="index.php?action=fs-get&type=themes&path=default/22/actions/document-save.png" title="Save" /><img onclick="//Add Content Here" src="index.php?action=fs-get&type=themes&path=default/22/actions/document-save-as.png" title="Save As" /><img onclick="//Add Content Here" src="index.php?action=fs-get&type=themes&path=default/22/actions/document-open.png" title="Open" /></div><textarea onkeydown="Core.Applications.Applications['+AppID+'].Saved=false;" style="position:relative; left:0px; top:20px; width:100%; height:'+(parseInt(document.getElementById("Window-"+this.MainWin["Id"]+"-Inner").style.height)-44)+'px; background-color:#EEEEEE; border-width:0;" value="Loading file..."></textarea>');
		this.Load();
	},
	OnWindowClose:function(WindowID)
	{
		if (this.Saved)
		{
			return true;
		}
		return confirm("Your about to quit without saving! Continue?");
	},
	Save:function()
	{
		Core.ServerCall.SendRequest("index.php?action=fs-put&path="+escape(this.Arguments),"contents="+escape(this.GetText()),function(Data){
			if (Data!=null && Data=="true"){Core.Applications.Applications[AppID].Saved=true; Core.Applications.Applications[AppID].SetText(Core.Applications.Applications[AppID].LastText); Core.MessageBox.ShowMessage("index.php?action=fs-get&type=themes&path=default/32/status/dialog-information.png",'File "'+Core.Applications.Applications[AppID].Description+'" has been saved!'); return;}Core.MessageBox.ShowMessage("index.php?action=fs-get&type=themes&path=default/32/status/dialog-warning.png",'Could not saved "'+Core.Applications.Applications[AppID].Description+'"! You may not have permission!');Core.Applications.Applications[AppID].SetText(Core.Applications.Applications[AppID].LastText);});	
		this.SetText("Saving...");
	},
	Load:function()
	{
		if (this.Arguments==""){return false;}
		Core.ServerCall.SendRequest("index.php?action=fs-get&encode=true&type=&path="+escape(this.Arguments),"",function(Data){Core.Applications.Applications[AppID].Saved=true; Core.Applications.Applications[AppID].SetText(Data);});
		this.SetText("Loading...");
	},
	SaveAs:function()
	{
		Core.Applications.Run("fileio.js","config","[Save|File|"+this.GetText()+"|"+AppID+"|OnFileIODone]");
		this.SetText("Save file as...");
	},
	Open:function()
	{
		Core.Applications.Run("fileio.js","config","[Open|File||"+AppID+"|OnFileIODone]");
		this.SetText("Open file...");
	},
	GetText:function()
	{
		return document.getElementById("Window-"+this.MainWin["Id"]+"-Inner").getElementsByTagName("textarea")[0].value;
	},
	SetText:function(Text)
	{
		this.LastText = document.getElementById("Window-"+this.MainWin["Id"]+"-Inner").getElementsByTagName("textarea")[0].value;
		document.getElementById("Window-"+this.MainWin["Id"]+"-Inner").getElementsByTagName("textarea")[0].value = Text;
	},
	OnResize:function(WindowID)
	{
		if (this.MainWin["Id"]==WindowID)
		{
			document.getElementById("Window-"+this.MainWin["Id"]+"-Inner").getElementsByTagName("textarea")[0].style.height=(parseInt(document.getElementById("Window-"+this.MainWin["Id"]+"-Inner").style.height)-44)+'px';
		}
	},
	OnResizing:function(WindowID)
	{
		if (this.MainWin["Id"]==WindowID)
		{
			this.OnResize(WindowID);
		}
	},
	OnMaximise:function(WindowID)
	{
		if (this.MainWin["Id"]==WindowID)
		{
			this.OnResize(WindowID);
		}
	},
	OnFileIODone:function(Result)
	{
		Result = Core.Parse.BreakApartChunks(Result);
		if (Result[0][0]=="Save")
		{
			this.Arguments=Result[0][1];
			this.Description=Result[0][1];
			this.SetText(this.LastText);
		}
		else
		{
			this.Arguments=Result[0][1];
			this.Description=Result[0][1];
			this.SetText(unescape(Result[0][2]));
		}
	},
}