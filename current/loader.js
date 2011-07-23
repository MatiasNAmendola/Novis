//Novis Base Loader
function LoadScript(Path)
{
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src = Path;
	document.getElementsByTagName("head")[0].appendChild(script);
}
LoadScript("modules/appman.js");
//Startup Applications
function Startup()
{
	//TODO: List of applications to startup
}