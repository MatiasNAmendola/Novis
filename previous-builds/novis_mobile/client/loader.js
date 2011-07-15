function Undefined(Value,Default)
{
	return (typeof Value == 'undefined' ? Default : Value);
}
function Inbetween(Value,Min,Max)
{
	return (Value>=Min&&Value<=Max);
}
function IsFunc(Obj)
{
	return (typeof Obj == 'function');
}

var System = {
	LoadedScriptIndex:0,
	Scripts:new Array(["Core","client/system.js"],["Effects","client/effects.js"],["Application Manager","client/appman.js"]),
	LoadNext:function()
	{
		if (this.LoadedScriptIndex>=this.Scripts.length){this.LoaderCleanup();return;}
		document.getElementById("Loader").innerHTML="Loading Novis ("+this.Scripts[this.LoadedScriptIndex][0]+")...";
		this.LoadScript(this.Scripts[this.LoadedScriptIndex][1]);
		this.LoadedScriptIndex++;
	},
	LoaderCleanup:function()
	{
		document.getElementById("Loader").innerHTML="";
		Effects.FadeElement.Start("Loading-Screen",0,function(){document.getElementById("Loading-Screen").style.display="none";System.Session.Startup();});
		delete this.LoadedScriptIndex;
		delete this.Scripts;
		delete this.LoadNext;
		delete this.LoaderCleanup;
	},
	LoadScript:function(Url)
	{
		var s = document.createElement("script");
		s.type="text/javascript";
		s.src=Url;
		document.getElementsByTagName("head")[0].appendChild(s);
	}
}
