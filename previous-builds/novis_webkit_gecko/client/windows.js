//Novis UI Window Manager
/*
 * TODO
 * -Dialogs
 * -Map Events
 * -Display/Hide window buttons when
 * */

System.Controls.Windows={
	Init:false,
	Configuration:{
		MinWidth:100,
		MinHeight:50,
	},
	Windows:new Array(),
	New:function(AppId,X,Y,Width,Height,ParentWindow,AsDialog)
	{
		//Code below could possibly load the css document many times but
		//can also help if the document doesn't load the first time.
		if (!System.Controls.Windows.Init){System.Loader.LoadCSS("client/controls/windows/style.css",function(){System.Controls.Windows.Init=true;});}
		//if (typeof System.Apps.Apps[AppId]=='undefined')
		//return false;
		
		var win = document.createElement("div");
		var id = "Window-"+System.Controls.Windows.Windows.length;
		win.id = id;
		win.className = "Window-Main Window-Main-Webkit";
		win.style.left = System.Environment.Window.Width/2+"px";
		win.style.top = System.Environment.Window.Height/2+"px";
		win.style.width = 0+"px";
		win.style.height = 0+"px";
		win.style.opacity = "0";
		win.style.display = "block";
		win.innerHTML = '<div class="Window-Background" id="'+id+'-Background"></div><div class="Window-Inner" id="'+id+'-Inner"></div><div class="Window-Title-Bar"><img class="Window-Title-Icon" id="'+id+'-Title-Icon" /><div id="'+id+'-Title" class="Window-Title-Text">Untitled Window "'+id+'"</div><div id="'+id+'-Buttons" class="Window-Title-Buttons"><img class="Window-Title-Buttons-Image" src="client/icons/default/minimise.png" /><img class="Window-Title-Buttons-Image" src="client/icons/default/maximise.png" /><img class="Window-Title-Buttons-Image" src="client/icons/default/close.png" /></div</div><div class="Window-Resize-LR" id="'+id+'-Resize-W"></div><div class="Window-Resize-LR" id="'+id+'-Resize-E" style="right:0px;"></div><div class="Window-Resize-TB" id="'+id+'-Resize-N"></div><div class="Window-Resize-TB" id="'+id+'-Resize-S" style="bottom:0px;"></div><div class="Window-Resize-Corners" id="'+id+'-Resize-NW"></div><div class="Window-Resize-Corners" id="'+id+'-Resize-NE" style="right:0px;"></div><div class="Window-Resize-Corners" id="'+id+'-Resize-SW" style="bottom:0px;"></div><div class="Window-Resize-Corners" id="'+id+'-Resize-SE" style="bottom:0px; right:0px;"></div>';
		
		var windowControls = {
			Id:function()
			{
				return id;
			},
			AppId:function()
			{
				return AppId;
			},
			Events:{
				OnCreate:null,
				OnMaximise:null,
				OnMinimise:null,
				OnResize:null,
				OnMove:null,
				OnTitleChange:null,
				OnIconChange:null,
				OnClose:null
			},
			CreateDialog:function(X,Y,Width,Height)
			{
				return System.Controls.Windows.New(AppId,X,Y,Width,Height,id,true);
			},
			Minimise:{
				AllowMinimise:function(Boolean)
				{
					document.getElementById(id).Internal.Minimise.Allow=Boolean;
					return Boolean;
				},
				IsMinimised:function()
				{
					return document.getElementById(id).Internal.Minimise.Is;
				},
				Minimise:function(Boolean)
				{
					if (!document.getElementById(id).Internal.Minimise.Allow)return false;
					if (!document.getElementById(id).Internal.Minimise.Is||Boolean)
					{
						System.Controls.Effects.FadeElement.Start(id,0,function(){document.getElementById(id).style.display="none";});
						document.getElementById(id).Internal.Minimise.Is=true;
					}
					else
					{
						document.getElementById(id).style.display="block";
						System.Controls.Effects.FadeElement.Start(id,100);
						document.getElementById(id).Internal.Minimise.Is=false;
					}
					return true;
				}
			},
			Maximise:{
				AllowMaxmise:function(Boolean)
				{
					document.getElementById(id).Internal.Maximise.Allow=Boolean;
					return Boolean;
				},
				IsMaximised:function()
				{
					return document.getElementById(id).Internal.Maximise.Is;
				},
				Maximise:function(Boolean)
				{
					if (!document.getElementById(id).Internal.Maximise.Allow||document.getElementById(id).Internal.Minimise.Is)return false;
					var inter = document.getElementById(id).Internal;
					if (!inter.Maximise.Is||Boolean)
					{
						inter.Maximise.Pos.OldX=parseInt(document.getElementById(id).style.left);
						inter.Maximise.Pos.OldY=parseInt(document.getElementById(id).style.top);
						inter.Maximise.Pos.OldW=parseInt(document.getElementById(id).style.width);
						inter.Maximise.Pos.OldH=parseInt(document.getElementById(id).style.height);
						var centerw = System.Environment.Window.Width/2-1;
						var centerh = System.Environment.Window.Height/2-1;
						System.Controls.Effects.MoveElement.Start(id,centerw-inter.Maximise.Pos.OldW/2,centerh-inter.Maximise.Pos.OldH/2,function(){System.Controls.Effects.ResizeElement.Start(id,true,System.Environment.Window.Width,System.Environment.Window.Height);});
						inter.Maximise.Is=true;
					}
					else
					{
						System.Controls.Effects.ResizeElement.Start(id,true,inter.Maximise.Pos.OldW,inter.Maximise.Pos.OldH,function(){System.Controls.Effects.MoveElement.Start(id,inter.Maximise.Pos.OldX,inter.Maximise.Pos.OldY);});
						inter.Maximise.Is=false;
					}
					return true;
				}
			},
			Resize:{
				CanResize:true,
				Minimum:{
					Width:-1,
					Height:-1,
				},
				Maximum:{
					Width:-1,
					Height:-1,
				},
				Resize:function(Width,Height,CenterResize)
				{
					if (!System.Controls.Windows.Windows[id].Resize.CanResize||document.getElementById(id).Internal.Maximise.Is||document.getElementById(id).Internal.Minimise.Is)return false;
					System.Controls.Effects.ResizeElement.Start(id,CenterResize,Width,Height);
					return true;
				}
			},
			Close:{
				ShowClose:function(Boolean)
				{
					if (Boolean)
					{
						//TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
					}
					
				},
				Close:function(WithForce)
				{
					/*
					 * TODO
					 * Check if is parent of dialog and if so (and not with force), return false.
					 */
					if (typeof System.Controls.Windows.Windows[id].Events.OnClose == 'function'&&!System.Controls.Windows.Windows[id].Events.OnClose()&&!WithForce)
					return false;
					System.Events.Dettach(win.Internal.Maximise.Event.Handle,win.Internal.Maximise.Event.Name,win.Internal.Maximise.Event.Function);
					System.Controls.Effects.FadeElement.Start(id,0,function(){document.body.removeChild(document.getElementById(id));},300);
					System.Controls.Effects.ResizeElement.Start(id,true,0,0);
					delete System.Controls.Windows.Windows[id];
					return true;
				}
			},
			ChangeTitle:function(Text)
			{
				document.getElementById(id+"-Title").innerHTML=Text;
				return Text;
			},
			ChangeIcon:function(Src)
			{
				document.getElementById(id+"-Title-Icon").src=Src;
				return Src;
			},
			Move:function(X,Y)
			{
				if (document.getElementById(id).Internal.Maximise.Is||document.getElementById(id).Internal.Minimise.Is)return false;
				System.Controls.Effects.MoveElement.Start(id,X,Y);
				return true;
			},
			Focus:function()
			{
				//TODO!!!!!!!!!!!!!!!!!!!!!!!!!!
			},
			Blur:function()
			{
				//TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			}
		}
		System.Controls.Windows.Windows[id]=windowControls;
		var internalControls = {
			Maximise:{
				Allow:true,
				Is:false,
				Do:function()
				{
					System.Controls.Windows.Windows[id].Maximise.Maximise();
				},
				Event:{
					Handle:window,
					Name:"resize",
					Function:function()
					{
						if (win.Internal.Maximise.Is)
						System.Controls.Effects.ResizeElement.Start(id,false,System.Environment.Window.Width,System.Environment.Window.Height);
					}
				},
				Pos:{
					OldX:0,
					OldY:0,
					OldW:0,
					OldH:0
				}
			},
			Minimise:{
				Allow:true,
				Is:false,
				Do:function()
				{
					System.Controls.Windows.Windows[id].Minimise.Minimise();
				}
			},
			PrevX:0,
			PrevY:0
		}
		win.Internal = internalControls;
		
		function AddAnchor(Handle,Id,Type)
		{
			Handle.onmousedown=function()
			{
				if (System.Controls.Windows.Windows[Id].Maximise.IsMaximised() || System.Controls.Windows.Windows[Id].Minimise.IsMinimised())return false;
				System.Environment.CapturedWindow.WindowId=Id;
				System.Environment.CapturedWindow.Type=Type;
				System.Environment.CapturedWindow.Cursor=document.body.style.cursor;
				document.getElementById(Id).Internal.PrevX=System.Environment.Window.X;
				document.getElementById(Id).Internal.PrevY=System.Environment.Window.Y;
				if (Type=="M"){System.Environment.SetCursor("move");}
				else{System.Environment.SetCursor(Type.toLowerCase()+"-resize");}
			}
			Handle.onmousemove=function()
			{
				if (System.Controls.Windows.Windows[Id].Maximise.IsMaximised() || System.Controls.Windows.Windows[Id].Minimise.IsMinimised())return false;
				System.Environment.CapturedWindow.Cursor=document.body.style.cursor;
				if (Type!="M"){System.Environment.SetCursor(Type.toLowerCase()+"-resize");}
			}
			Handle.onmouseout=function()
			{
				if (System.Environment.CapturedWindow.WindowId != null)return false;
				//document.body.style.cursor = System.Environment.CapturedWindow.Cursor; <-- Again, assuming default cursor
				System.Environment.SetCursor("default");
			}
		}
		System.Events.Attach(win.Internal.Maximise.Event.Handle,win.Internal.Maximise.Event.Name,win.Internal.Maximise.Event.Function);
		
		document.body.appendChild(win);
		//Add resize and move UI controls
		AddAnchor(document.getElementById(id+"-Resize-W"),id,"W");
		AddAnchor(document.getElementById(id+"-Resize-E"),id,"E");
		AddAnchor(document.getElementById(id+"-Resize-N"),id,"N");
		AddAnchor(document.getElementById(id+"-Resize-S"),id,"S");
		AddAnchor(document.getElementById(id+"-Resize-NW"),id,"NW");
		AddAnchor(document.getElementById(id+"-Resize-NE"),id,"NE");
		AddAnchor(document.getElementById(id+"-Resize-SW"),id,"SW");
		AddAnchor(document.getElementById(id+"-Resize-SE"),id,"SE");
		AddAnchor(document.getElementById(id+"-Title").parentNode,id,"M");
		//Add code to window buttons
		document.getElementById(id+"-Title").parentNode.ondblclick = function(){System.Controls.Windows.Windows[id].Maximise.Maximise();}
		document.getElementById(id+"-Buttons").children[0].onclick = function(){System.Controls.Windows.Windows[id].Minimise.Minimise();}
		document.getElementById(id+"-Buttons").children[1].onclick = function(){System.Controls.Windows.Windows[id].Maximise.Maximise();}
		document.getElementById(id+"-Buttons").children[2].onclick = function(){System.Controls.Windows.Windows[id].Close.Close();}
		
		System.Controls.Effects.ResizeElement.Start(id,true,Width,Height,function(){System.Controls.Effects.MoveElement.Start(id,X,Y);});
		setTimeout(function(){System.Controls.Effects.FadeElement.Start(id,100);},150);
		return id;
	},
	Close:function(WindowId,WithForce)
	{
		var win = System.Controls.Windows.Windows[WindowId];
		if (typeof win == 'undefined')return false;
		return win.Close.Close(System.Misc.Undefined(WithForce,false));
	},
	Window:function(WindowId)
	{
		//Check if window exists
		//return document.getElementById(WindowId);
		//Useful for adding controls to a window
	},
	KillAll:function(AppId)
	{
		for (var window in System.Controls.Windows.Windows)
		{
			if (System.Controls.Windows.Windows[window].AppId() == AppId)
			{
				System.Controls.Windows.Close(window,true);
			}
		}
	}
}
//Windows UI Code
//Resizing and Moving window code and changing cursor accordingly
System.Environment.CapturedWindow = {
	WindowId:null,
	Type:null,
	Cursor:null
}
System.Events.Attach(document,"mouseup",function()
{
	if (System.Environment.CapturedWindow.WindowId==null)return;
	System.Environment.CapturedWindow.WindowId = null;
	//System.Environment.SetCursor(System.Environment.CapturedWindow.Cursor); <-- This was causing most of the problems
	//Now the code assumes that the previous cursor always is default
	System.Environment.SetCursor("default");
});
System.Events.Attach(document.getElementById("Desktop"),"mousemove",function()
{
	if (System.Environment.CapturedWindow.WindowId!=null)return;
	System.Environment.CapturedWindow.WindowId = null;
	System.Environment.SetCursor("default");
});
System.Events.Attach(document,"mousemove",function()
{
	var win = System.Controls.Windows.Windows[System.Environment.CapturedWindow.WindowId];
	if (win != null&&System.Misc.IsInbetween(System.Environment.Window.X,0,System.Environment.Window.Width)&&System.Misc.IsInbetween(System.Environment.Window.Y,0,System.Environment.Window.Height)&&!(win.Maximise.IsMaximised() || win.Minimise.IsMinimised()))
	{
		var windom = document.getElementById(System.Environment.CapturedWindow.WindowId).style;
		var prevMouse = document.getElementById(System.Environment.CapturedWindow.WindowId).Internal;
		switch (System.Environment.CapturedWindow.Type)
		{
			case "N":
			case "S":
				var ny = prevMouse.PrevY-System.Environment.Window.Y;
				var nh = parseFloat(windom.height)-ny;
				var minh = win.Resize.Minimum.Height;
				var maxh = win.Resize.Maximum.Height;
				if (minh == -1){minh = System.Controls.Windows.Configuration.MinHeight;}
				if (maxh == -1){maxh = System.Environment.Window.Height;}
				if (System.Environment.CapturedWindow.Type=="N") {nh = nh+(ny*2);}
				if (System.Misc.IsInbetween(nh,minh,maxh)&&nh>=System.Controls.Windows.Configuration.MinHeight)
				{
					if (System.Environment.CapturedWindow.Type=="N")
					{
						windom.top = parseFloat(windom.top)-ny+"px";
					}
					windom.height = nh+"px";
					prevMouse.PrevY = System.Environment.Window.Y;
				}
			break;
			case "W":
			case "E":
				var nx = prevMouse.PrevX-System.Environment.Window.X;
				var nw = parseFloat(windom.width)-nx;
				var minw = win.Resize.Minimum.Width;
				var maxw = win.Resize.Maximum.Width;
				if (minw == -1){minw = System.Controls.Windows.Configuration.MinWidth;}
				if (maxw == -1){maxw = System.Environment.Window.Width;}
				if (System.Environment.CapturedWindow.Type=="W") {nw = nw+(nx*2);}
				if (System.Misc.IsInbetween(nw,minw,maxw))
				{
					if (System.Environment.CapturedWindow.Type=="W")
					{
						windom.left = parseFloat(windom.left)-nx+"px";
					}
					windom.width = nw+"px";
					prevMouse.PrevX = System.Environment.Window.X;
				}
			break;
			case "NE":
			case "SE":
				var nx = prevMouse.PrevX-System.Environment.Window.X;
				var ny = prevMouse.PrevY-System.Environment.Window.Y;
				var nw = parseFloat(windom.width)-nx;
				var nh = parseFloat(windom.height)-ny;
				var minw = win.Resize.Minimum.Width;
				var maxw = win.Resize.Maximum.Width;
				var minh = win.Resize.Minimum.Height;
				var maxh = win.Resize.Maximum.Height;
				if (minh == -1){minh = System.Controls.Windows.Configuration.MinHeight;}
				if (maxh == -1){maxh = System.Environment.Window.Height;}
				if (minw == -1){minw = System.Controls.Windows.Configuration.MinWidth;}
				if (maxw == -1){maxw = System.Environment.Window.Width;}
				if (System.Environment.CapturedWindow.Type=="NE") {nh = nh+(ny*2);}
				if (System.Misc.IsInbetween(nh,minh,maxh))
				{
					if (System.Environment.CapturedWindow.Type=="NE")
					{
						windom.top = parseFloat(windom.top)-ny+"px";
					}
					windom.height = nh+"px";
					prevMouse.PrevY = System.Environment.Window.Y;
				}
				if (System.Misc.IsInbetween(nw,minw,maxw)&&nw>=System.Controls.Windows.Configuration.MinWidth)
				{
					windom.width = nw+"px";
					prevMouse.PrevX = System.Environment.Window.X;
				}
			break;
			case "NW":
			case "SW":
				var nx = prevMouse.PrevX-System.Environment.Window.X;
				var ny = prevMouse.PrevY-System.Environment.Window.Y;
				var nw = parseFloat(windom.width)-nx;
				var nh = parseFloat(windom.height)-ny;
				var minw = win.Resize.Minimum.Width;
				var maxw = win.Resize.Maximum.Width;
				var minh = win.Resize.Minimum.Height;
				var maxh = win.Resize.Maximum.Height;
				if (minh == -1){minh = System.Controls.Windows.Configuration.MinHeight;}
				if (maxh == -1){maxh = System.Environment.Window.Height;}
				if (minw == -1){minw = System.Controls.Windows.Configuration.MinWidth;}
				if (maxw == -1){maxw = System.Environment.Window.Width;}
				if (System.Environment.CapturedWindow.Type=="NW") {nh = nh+(ny*2); }
				nw = nw+(nx*2);
				if (System.Misc.IsInbetween(nh,minh,maxh))
				{
					if (System.Environment.CapturedWindow.Type=="NW")
					{
						windom.top = parseFloat(windom.top)-ny+"px";
					}
					windom.height = nh+"px";
					prevMouse.PrevY = System.Environment.Window.Y;
				}
				if (System.Misc.IsInbetween(nw,minw,maxw))
				{
					windom.left = parseFloat(windom.left)-nx+"px";
					windom.width = nw+"px";
					prevMouse.PrevX = System.Environment.Window.X;
					
				}
			break;
			case "M":
				var nx = prevMouse.PrevX-System.Environment.Window.X;
				var ny = prevMouse.PrevY-System.Environment.Window.Y;
				windom.top = parseFloat(windom.top)-ny+"px";
				windom.left = parseFloat(windom.left)-nx+"px";
				prevMouse.PrevX = System.Environment.Window.X;
				prevMouse.PrevY = System.Environment.Window.Y;
			break;
		}
	}
});
