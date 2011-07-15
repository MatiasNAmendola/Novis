//Novis Loader

//Things to improve on
//- Memory handling of arrays (they will become huge to the possibility bigger than int32)
//	Fix by using push, pop and sort which helps that but may alter performance
//- Something seems still not to be right with threading. It is currently dynamic but something about it isn't right.
var System = {
	Misc:{
		Undefined:function(Value,Default)
		{
			if (typeof Value == 'undefined')
			return Default;
			return Value;
		},
		IsFunction:function(Value)
		{
			if (System.Misc.Undefined(Value,false)&&typeof Value == 'function')
			return true;
			return false;
		},
		IsInbetween:function(Value,Min,Max)
		{
			if (Value>=Min&&Value<=Max)
			return true;
			return false;
		},
		NoCache:function()
		{
			return (location.search.substr(1)=="nocache");
		},
	},
	AJAX:function(Url,PostData,Callback)
	{
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange=function()
		{
			if (xmlHttp.readyState==4)
			{
				if (xmlHttp.status==200)
				{
					if (Callback!=undefined && Callback!=null)
					{
						Callback(unescape(xmlHttp.responseText));
					}
				}
				else
				{
					if (Callback!=undefined && Callback!=null)
					{
						Callback(null);
					}
				}
			}
		}
		xmlHttp.open("POST",Url,true);
		xmlHttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		xmlHttp.send(PostData);
		return true;
	},
	Environment:{
		SetCursor:function(Cursor)
		{
			document.body.style.cursor=Cursor;
			document.getElementById("Desktop").style.cursor=Cursor;
		},
		Time:{
			ThreadId:null,
			Normal:true,
			Time:null,
			FTime:null,
			Setup:function()
			{
				System.Environment.Time.ThreadId = System.Threading.NewFromFile("client/resources/time.thread.js",function(Message){
					System.Environment.Time.Time = Message;
					var time = Message;
					time = time.substr(1,time.length-2);
					time = time.split("|");
					var tmpHours = parseInt(time[0]);
					var tmpMinutes = parseInt(time[1]);
					var tmpSeconds = parseInt(time[2]);
					switch (System.Environment.Time.Normal)
					{
						case true:
							if (tmpHours>12){tmpHours=tmpHours-12;}
						case false:
							if (tmpHours<10){tmpHours="0"+tmpHours;}
							if (tmpMinutes<10){tmpMinutes="0"+tmpMinutes;}
							if (tmpSeconds<10){tmpSeconds="0"+tmpSeconds;}
							System.Environment.Time.FTime = tmpHours+":"+tmpMinutes+":"+tmpSeconds;
						break;
					}
				});
			},
			SetTime:function(Hour,Minute,Second)
			{
				System.Threading.Message(System.Environment.Time.ThreadId,"["+Hour+"|"+Minute+"|"+Second+"]");
			}
		},
		Window:{
			Init:false,
			X:0,
			Y:0,
			Width:0,
			Height:0,
			Setup:function()
			{
				if (System.Environment.Window.Init)return false;
				var resize = function(){System.Environment.Window.Width=window.innerWidth;System.Environment.Window.Height=window.innerHeight;}
				System.Events.Attach(window,"resize",resize);
				var mouse = function(Event){System.Environment.Window.X=Event.pageX;System.Environment.Window.Y=Event.pageY;}
				System.Events.Attach(window,"mousemove",mouse);
				resize();
				System.Environment.Window.Init=true;
				return true;
			},
		},
	},
	Loader:{
		Startup:{
			Start:function()
			{
				var scripts = new Array("client/effects.js","client/appman.js","client/windows.js","client/session.js","client/controls.js","client/parse.js","client/servercon.js","client/messclient.js");
				System.Controls.ProgressBar.New(document.getElementById("Loading"),"Progress",scripts.length,null,function(){System.Controls.Effects.FadeElement.Start("Loading",0,function(){document.body.removeChild(document.getElementById("Loading"));},2500);System.Messaging.Run();System.Session.Login();});
				for (var i = 0; i < scripts.length; i++)
				{
					System.Loader.LoadScript(scripts[i],function(){System.Loader.Startup.UpdateProgress();});
				}
				System.Environment.Time.Setup();
				System.Environment.Window.Setup();
			},
			UpdateProgress:function()
			{
				document.getElementById("Progress").Update();
			},
		},
		LoadScript:function(Url,Callback)
		{
			var source = System.Storage.Read("Script: "+Url);
			if (!source||System.Misc.NoCache())
			{
				System.AJAX(Url,null,function(Data){
					System.Storage.Write("Script: "+Url,Data);
					System.Loader.InsertScript(Data);
					if (System.Misc.IsFunction(Callback)) Callback();
				});
			}
			else
			{
				System.Loader.InsertScript(source);
				if (System.Misc.IsFunction(Callback)) Callback();
			}
		},
		LoadCSS:function(Url,Callback)
		{
			var source = System.Storage.Read("Style: "+Url);
			if (!source||System.Misc.NoCache())
			{
				System.AJAX(Url,null,function(Data){
					System.Storage.Write("Style: "+Url,Data);
					System.Loader.InsertStyle(Data);
					if (System.Misc.IsFunction(Callback)) Callback();
				});
			}
			else
			{
				System.Loader.InsertStyle(source);
				if (System.Misc.IsFunction(Callback)) Callback();
			}
		},
		InsertScript:function(Data)
		{
			var scr = document.createElement("script");
			scr.type = "text/javascript";
			scr.innerHTML = Data;
			document.getElementsByTagName("head")[0].appendChild(scr);
		},
		InsertStyle:function(Data)
		{
			var sty = document.createElement("style");
			sty.type = "text/css";
			sty.rel = "stylesheet";
			sty.innerHTML = Data;
			document.getElementsByTagName("head")[0].appendChild(sty);
		}
	},
	Storage:{
		Init:false,
		DB:null,
		Setup:function()
		{
			if (System.Storage.Init)return true;
			if (typeof localStorage == 'undefined')return false;
			System.Storage.DB = localStorage;	
			System.Storage.Init=true;
			return true;
		},
		Write:function(Key,Value)
		{
			if (!System.Storage.Init){if (!System.Storage.Setup())return false;}
			System.Storage.DB.setItem(Key, Value);
			return true;
		},
		Read:function(Key)
		{
			if (!System.Storage.Init){if (!System.Storage.Setup())return false;}
			return System.Storage.DB.getItem(Key);
		},
		Delete:function(Key)
		{
			if (!System.Storage.Init){if (!System.Storage.Setup())return false;}
			System.Storage.DB.removeItem(Key);
			return true;
		},
		GetKey:function(Position)
		{
			if (!System.Storage.Init){if (!System.Storage.Setup())return false;}
			if (!System.Misc.IsInbetween(Position,0,System.Storage.DB.length))return null;
			return System.Storage.DB.key(Position); 
		},
		Size:function()
		{
			if (!System.Storage.Init){if (!System.Storage.Setup())return false;}
			return System.Storage.DB.length;
		}
	},
	Threading:{
		Threads:new Array(),
		New:function(Code,OnMessage,OnError)
		{
			var i = System.Threading.Threads.push({Thread:new Worker("client/thread.js?"+System.Threading.Threads.length),OnMessage:OnMessage,OnError:OnError,Errors:new Array()})-1;
			System.Threading.Threads[i].Thread.onerror=System.Threading.Bindings.OnError;
			System.Threading.Message(i,">>EVAL|"+escape(Code));
			System.Threading.Threads[i].Thread.onmessage=System.Threading.Bindings.OnMessage;
			return i;
		},
		NewFromFile:function(File,OnMessage,OnError,Callback)
		{
			System.AJAX(File,null,function(Data){
				var i = System.Threading.New(Data,OnMessage,OnError);
				if (typeof Callback == 'function')
				Callback(i);
			});
		},
		GetThreadById:function(Id)
		{
			if (System.Misc.IsInbetween(Id,0,System.Threading.Threads.length))
			return System.Threading.Threads[Id];
			return null;
		},
		Message:function(Id,Message)
		{
			var t = System.Threading.GetThreadById(Id);
			if (t&&t.Thread&&typeof t.Thread.postMessage=='function')
			{
				t.Thread.postMessage(Message);
				return true;
			}
			return false;
		},
		Terminate:function(Id)
		{
			var t = System.Threading.GetThreadById(Id);
			if (t&&t.Thread&&typeof t.Thread.terminate=='function')
			{
				t.Thread.terminate();
				delete System.Threading.Threads[Id];
				return true;
			}
			return false;
		},
		//Internal Use Only
		Bindings:{
			OnMessage:function(Event)
			{
				var split = Event.data.indexOf("|");
				if (Event.data.indexOf(">>")==0)
				{
					//Error Message
					var id = parseInt(Event.data.substr(2,split-2));
					var message = unescape(Event.data.substr(split+1));
					var t = System.Threading.GetThreadById(id);
					t.Errors.push(message);
					if (System.Misc.IsFunction(t.OnError))
					{
						t.OnError(message);
					}
				}
				else
				{
					//Normal Message
					var id = Event.data.substr(0,split);
					var message = unescape(Event.data.substr(split+1));
					var t = System.Threading.GetThreadById(id);
					if (System.Misc.IsFunction(t.OnMessage))
					{
						t.OnMessage(message);
					}
				}
			}
		}
	},
	Events:{
		Attach:function(Handle,Name,Function)
		{
			Handle.addEventListener(Name,Function,false);
		},
		Dettach:function(Handle,Name,Function)
		{
			Handle.removeEventListener(Name,Function,false);
		}
	},
	Controls:{
		Styling:{
			BorderRadius:{
				Set:function(HTMLObj,String)
				{
					if (HTMLObj.style.borderRadius!=undefined){HTMLObj.style.borderRadius = String}
					else if (HTMLObj.style.MozBorderRadius!=undefined){HTMLObj.style.MozBorderRadius = String}
					else if (HTMLObj.style.WebkitBorderRadius!=undefined) {HTMLObj.style.WebkitBorderRadius = String}
				},
				Get:function(HTMLObj)
				{
					if (HTMLObj.style.borderRadius!=undefined){return HTMLObj.style.borderRadius}
					else if (HTMLObj.style.MozBorderRadius!=undefined){return HTMLObj.style.MozBorderRadius}
					else if (HTMLObj.style.WebkitBorderRadius!=undefined) {return HTMLObj.style.WebkitBorderRadius}
					return null;
				}
			},
			BoxShadows:{
				Set:function(HTMLObj,String)
				{
					if (HTMLObj.style.boxShadow!=undefined){HTMLObj.style.boxShadow = String}
					else if (HTMLObj.style.MozBoxShadow!=undefined){HTMLObj.style.MozBoxShadow = String}
					else if (HTMLObj.style.WebkitBoxShadow!=undefined) {HTMLObj.style.WebkitBoxShadow = String}
				},
				Get:function(HTMLObj)
				{
					if (HTMLObj.style.boxShadow!=undefined){return HTMLObj.style.boxShadow}
					else if (HTMLObj.style.MozBoxShadow!=undefined){return HTMLObj.style.MozBoxShadow}
					else if (HTMLObj.style.WebkitBoxShadow!=undefined) {return HTMLObj.style.WebkitBoxShadow}
					return null;
				}
			}
		},
		ProgressBar:{
			Init:false,
			New:function(Parent,Id,Max,OnChange,OnComplete)
			{
				if (!System.Controls.ProgressBar.Init){System.Loader.LoadCSS("client/controls/progressbar/style.css",function(){System.Controls.ProgressBar.Init=true;});}
				var progBar = document.createElement("div");
				Max = parseInt(Max);
				progBar.id = Id;
				progBar.className="Progress-Bar Progress-Bar-Webkit";
				System.Controls.Styling.BorderRadius.Set(progBar,"5px");
				progBar.innerHTML="<div class='Inner-Progress-Bar Inner-Progress-Bar-Webkit' style='height:100%;width:0%'>0%</div>";
				System.Controls.Styling.BorderRadius.Set(progBar.children[0],"5px");
				progBar.Max = Max;
				progBar.Current = 0;
				progBar.ChangeWidth = function(Width)
				{
					progBar.style.width = Width+"px";
				}
				progBar.ChangeHeight = function(Height)
				{
					progBar.style.height = Height+"px";
				}
				progBar.GetProgress = function() {return progBar.Current;}
				progBar.Update = function(Value)
				{
					var curPercent = progBar.Current/Max*100;
					Value = parseInt(System.Misc.Undefined(Value,progBar.Current+1));
					if (Value>Max||Value<0){return;}
					if (System.Controls.Effects)
					{
						System.Controls.Effects.NumberTransition.Start("Progress",curPercent,Value/Max*100,function(Next){
						var percent = Math.round(Next)+"%";
						progBar.children[0].style.width=percent;
						progBar.children[0].innerHTML=percent;
						});
					}
					else
					{
						var percent = Value/Max*100+"%";
						progBar.children[0].style.width=percent;
						progBar.children[0].innerHTML=percent;
					}
					progBar.Current = Value;
					progBar.title = Value+" out of "+Max;
					if (Value!=0&&Value<Max&&System.Misc.IsFunction(progBar.OnChange)){progBar.OnChange(progBar.id,Value);}
					else if (Value!=0&&Value==Max&&System.Misc.IsFunction(progBar.OnComplete)) {progBar.OnComplete(progBar.id);}
				}
				progBar.Remove = function() {Parent.removeChild(progBar);}
				progBar.OnChange = OnChange;
				progBar.OnComplete = OnComplete;
				progBar.ChangeWidth(250);
				progBar.ChangeHeight(16);
				progBar.Update(0);
				Parent.appendChild(progBar);
			}
		}
	}
}
