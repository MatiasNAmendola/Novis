Name::Novis Settings Manager
Version::1.0
CreatedBy::James Turner
Company::Turner Software
Website::http://www.turnersoftware.au.com
Code::={
	OnLaunch:function(Arguments)
	{
		this.MainWin = new Core.Applications.Window(60,60,300,350,AppID);
		Core.API.Windows.AllowResize(this.MainWin["Id"],false);
		this.MainWin["LinkWithApp"]=true;
		this.MainWin["AllowMaximise"]=false;
		this.MainWin["AllowMinimise"]=true;
		this.ColourControls = ["Body","Menu"];
		this.Description = "Display Settings";
		Core.Menu.ChangeItemImage(this.MainWin["Id"],"index.php?action=fs-get&type=themes&path="+escape("default/22/apps/preferences-desktop-wallpaper.png"));
		Core.API.Windows.Title(this.MainWin["Id"],"Display Settings");
		Core.API.Windows.Icon(this.MainWin["Id"],"index.php?action=fs-get&type=themes&path="+escape("default/22/apps/preferences-desktop-wallpaper.png"));
		Core.API.Windows.InnerText(this.MainWin["Id"],"<div style='text-align:center;'><strong>Display Settings</strong><hr />System Colours<br /><select id='"+AppID+"-Settings-Colour-Element' onchange='Core.Applications.Applications["+AppID+"].GetColour();'>"+this.GetItems()+"</select><select id='"+AppID+"-Settings-Colour-Type' onchange='Core.Applications.Applications["+AppID+"].GetColour();'>"+this.InsertTypes+"</select><br />RGB: <input type='text' value='' id='"+AppID+"-Settings-Colour-Red' size='2' maxLength='3' onkeyup='Core.Applications.Applications["+AppID+"].ShowColour();' /> <input type='text' value='' id='"+AppID+"-Settings-Colour-Green' size='2' maxLength='3' onkeyup='Core.Applications.Applications["+AppID+"].ShowColour();' /> <input type='text' value='' id='"+AppID+"-Settings-Colour-Blue' size='2' maxLength='3' onkeyup='Core.Applications.Applications["+AppID+"].ShowColour();' /><br /><div id='"+AppID+"-Test-Colour' style='width:100%'><input type='button' value='Apply' onclick='Core.Applications.Applications["+AppID+"].ApplyColour();' /></div><br /><strong>Theme</strong><hr />NOT YET IMPLEMENTED<br /><br /><strong>Misc</strong><hr />AJAX Loader<br /><img style='width:16px; height:16px;' src='"+this.GetAjaxLoaderSrc()+"' /><input type='button' value='Browse (NYI)' /><img style='width:16px; height:16px;' src='"+this.GetAjaxLoaderSrc()+"' /><br />Background Image<br /><small>Replaces Theme's Background Image</small><input type='button' value='Browse (NYI)' /></div>");
		this.GetColour();
		this.ShowColour();
	},
	ApplyColour:function()
	{
		var r = parseInt(document.getElementById(AppID+"-Settings-Colour-Red").value);
		var g = parseInt(document.getElementById(AppID+"-Settings-Colour-Green").value);
		var b = parseInt(document.getElementById(AppID+"-Settings-Colour-Blue").value);
		var colourList = document.getElementById(AppID+"-Settings-Colour-Element");
		var element = colourList.options[colourList.selectedIndex].value;
		var typeList = document.getElementById(AppID+"-Settings-Colour-Type");
		var type = typeList.options[typeList.selectedIndex].value;
		Core.Effects.ColourFade(element,"rgb("+r+","+g+","+b+")",type,10);
	},
	InsertTypes:function()
	{
		return "<option value='style.backgroundColor'>Background Colour</option><option value='style.color'>Text Colour</option>";
	},
	GetItems:function()
	{
		var html = "";
		for (var i = 0; i < this.ColourControls.length; i++)
		{
			html+="<option value='"+this.ColourControls[i]+"'>"+this.ColourControls[i]+"</option>";
		}
		return html;
	},
	GetColour:function()
	{
		var colourList = document.getElementById(AppID+"-Settings-Colour-Element");
		var element = colourList.options[colourList.selectedIndex].value;
		var typeList = document.getElementById(AppID+"-Settings-Colour-Type");
		var type = typeList.options[typeList.selectedIndex].value;
		var colour = Core.Effects.ColourToRGB(eval("document.getElementById('"+element+"')."+type));
		document.getElementById(AppID+"-Settings-Colour-Red").value=colour[0];
		document.getElementById(AppID+"-Settings-Colour-Green").value=colour[1];
		document.getElementById(AppID+"-Settings-Colour-Blue").value=colour[2];
	},
	ShowColour:function()
	{
		var r = parseInt(document.getElementById(AppID+"-Settings-Colour-Red").value);
		if (isNaN(r)){r=0;}
		var g = parseInt(document.getElementById(AppID+"-Settings-Colour-Green").value);
		if (isNaN(g)){g=0;}
		var b = parseInt(document.getElementById(AppID+"-Settings-Colour-Blue").value);
		if (isNaN(b)){b=0;}
		document.getElementById(AppID+"-Test-Colour").style.backgroundColor="rgb("+r+","+g+","+b+")";
	},
	GetAjaxLoaderSrc:function()
	{
		return document.getElementById("Ajax").getElementsByTagName("img")[0].src;
	},
}