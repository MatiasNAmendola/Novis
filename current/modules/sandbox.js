function GetURLInfo()
{
	var url = (location.search.length>=1?location.search.substr(1):null);
	if (url==null) return null;
	var keypairs = url.split("&");
	var items = new Array();
	var item;
	for (var keypair in keypairs)
	{
		item = keypairs[keypair].split("=");
		items[item[0]] = item[1];
	}
	return items;
}
importScripts("modules/sandbox_ext.js");
var url = GetURLInfo();
importScripts(unescape(url["url"]));