Name::Novis Login Application
Version::1.0
CreatedBy::James Turner
Company::Turner Software
Website::http://www.turnersoftware.au.com
Code::={
	OnLaunch:function(Arguments)
	{
		this.LoginWin = new Core.Applications.Window(50,50,400,200,AppID);
		this.LoginWin["AllowMaximise"]=false;
		this.LoginWin["AllowMinimise"]=false;
		this.LoginWin["AllowClose"]=false;
		this.Description="Novis 0.8";
		this.LoginText = "<div style='width:100%;'><span style='text-align:center;'><h3>Novis</h3></span><form onsubmit='Core.Applications.Applications["+AppID+"].TryLogin(); return false;'>Username<input style='width:100%; background-color:#EEEEEE; border-width:0;' id='Novis-Login-Username' type='text' /><br />Password<br /><input style='width:100%; background-color:#EEEEEE; border-width:0;' id='Novis-Login-Password' type='password' /><br /><br /><div style='text-align:center;'><input type='submit' value='Continue' /><div></form><span id='Novis-Login-Status'></span></div>";
		Core.API.Windows.Title(this.LoginWin["Id"],"Login To Novis");
		Core.API.Windows.Icon(this.LoginWin["Id"],"index.php?action=fs-get&type=themes&path="+escape("default/22/apps/system-users.png"));
		Core.API.Windows.AllowResize(this.LoginWin["Id"],false);
		Core.API.Windows.CentreWindow(this.LoginWin["Id"]);
		Core.API.Windows.InnerText(this.LoginWin["Id"],"Checking Login Status...");
		this.CheckStatus();
	},
	TryLogin:function()
	{
		document.getElementById("Novis-Login-Status").innerHTML="Logging In...";
		Core.ServerCall.SendRequest("index.php?action=login","user="+escape(document.getElementById("Novis-Login-Username").value)+"&password="+escape(document.getElementById("Novis-Login-Password").value),function(Data){if(Data!=null){
				if (Data=="true"){Core.Applications.Applications[AppID].DoLoad();}
				else {document.getElementById("Novis-Login-Status").innerHTML="Login Failed!";}
				}});
	},
	CheckStatus:function()
	{
		Core.ServerCall.SendRequest("index.php?action=status","",function(Data){if(Data!=null){
				if (Data=="true"){Core.Applications.Applications[AppID].DoLoad();}if (Data=="false"){Core.Applications.Applications[AppID].ShowLogin();}
				}});
	},
	DoLoad:function()
	{
		Core.Sound.SimplyPlay("index.php?action=fs-get&type=sound&path=login.ogg",100);
		Core.MessageBox.ShowMessage("index.php?action=fs-get&type=static&path=novis-n.png","Welcome to Novis!",false);
		Core.API.Windows.InnerText(this.LoginWin["Id"],"Loading Desktop...");
		Core.Session.ClosePrompt=true;
		Core.Effects.Fade("NotLoggedIn",0,5,'document.getElementById("NotLoggedIn").style.display="none";');
		document.getElementById("Desktop-Icons").style.display="block";
		Core.Effects.Fade("Desktop-Icons",100,5);
		document.getElementById("WinControls").style.display="block";
		Core.Session.RefreshUserInfo();
		Core.ServerCall.SendRequest("index.php?action=fs-get&type=home","",function(Data){if(Data!=null){
				Core.Desktop.BuildDirectoryStructure("Desktop-Icons",4,Data);
				Core.Applications.CloseApplication(AppID);
				}});
	},
	ShowLogin:function()
	{
		Core.API.Windows.InnerText(this.LoginWin["Id"],this.LoginText);
		document.getElementById("Novis-Login-Username").focus();
	}
}
