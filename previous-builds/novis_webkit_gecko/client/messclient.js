//Novis Internal and External Messaging Interface

System.Messaging={
	MAppId:null,
	Messages:new Array(),
	Run:function()
	{
		//RUN MESSAGING APPLICATION
	},
	ShowMessage:function(Text)
	{
		//Like an alert box
	},
	CaptureDialog:function(Text,Callback)
	{
		//Like an input box
	},
	ConfirmDialog:function(Text,Callback)
	{
		//Like a confirm dialog
	},
	Notification:function(IconSrc,Text)
	{
	},
	MessageApp:function(AppId,Text,Callback)
	{
		if (typeof System.Apps.Apps[AppId] != 'undefined' && typeof System.Apps.Apps[AppId].OnMessage == 'function')
		{
			System.Apps.Apps[AppId].OnMessage(Text,Callback);
			return true;
		}
		return false;
	},
}
