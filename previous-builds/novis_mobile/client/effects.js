//Effects Engine

//Might need to rework how it cancels repeating effects as it still needs to loop through a million undefined effect objects
//which, over time, would slow down the performance of Novis. Consider using foreach instead and use the effectid as a string
//not a number.

//Also, might overhaul to use a dom object rather then a element id as some elements might not have a element id.

if (typeof Undefined != 'function')
function Undefined(Value,Default)
{
	return (typeof Value == 'undefined' ? Default : Value);
}

Effects = {
	Effects:new Array(),
	/* 5 = Full | 4 = Slightly Faster (less moves) | 3 = More jerky movements | 2 = Drop all sliding | 1 = Drop all fading */
	Quality:5,
	GetNewId:function()
	{
		var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);}).toUpperCase();
		return (typeof this.Effects[id] == "undefined" ? id : this.GetNewId());
	},
	CancelEffect:function(Id)
	{
		if (!this.Effects[Id]){return false;}
		clearTimeout(this.Effects[Id]["Timeout"]);
		this.RemoveEffectObj(this.Effects[Id]["ElementId"],Id); //Allows JS to know when its being manipulated
		//Do Callback
		this.DoCallback(this.Effects[Id]["Callback"],Id);
		delete this.Effects[Id];
		return true;
	},
	CancelRepeating:function(ElementId,Type)
	{
		for (var i in this.Effects)
		{
			if (this.Effects[i]["ElementId"]==ElementId&&this.Effects[i]["Type"]==Type)
			{
				this.CancelEffect(i);
				return true;
			}
		}
	},
	AppendEffectObj:function(ElementId,EffectId,Type)
	{
		var e = document.getElementById(ElementId);
		if (e == null){return false;}
		if (typeof e.Effects != "object")
		{
			e.Effects = {
				Effects:new Array(),
				StopMovingEffects:function()
				{
					for (var i in this.Effects)
					{
						if (this.Effects[i].Type == "MoveElement"||this.Effects[i].Type == "ResizeElement")
						{
							this.CancelEffect(this.Effects[i].Id);
						}
					}
				},
				StopFadingEffects:function()
				{
					for (var i in this.Effects)
					{
						if (this.Effects[i].Type == "FadeElement"||this.Effects[i].Type == "ColourFadeElement")
						{
							this.CancelEffect(this.Effects[i].Id);
						}
					}
				},
				StopAllEffects:function()
				{
					e.Effects.StopMovingEffects();
					e.Effects.StopFadingEffects();
				}
			}
		}
		e.Effects.Effects.push({Type:Type,Id:EffectId});
	},
	RemoveEffectObj:function(ElementId,EffectId)
	{
		var e = document.getElementById(ElementId);
		if (e == null || typeof e.Effects == "undefined")return false;
		for (var i in e.Effects.Effects)
		{
			if (e.Effects.Effects[i].Id == EffectId)
			{
				e.Effects.Effects.splice(i,1);
				return;
			}
		}
	},
	DoCallback:function(Callback,EffectId)
	{
		if (typeof Callback == "function")
		{
			Callback(EffectId);
			return true;
		}
		return false;
	},
	MoveElement:{
		Duration:1000,
		Start:function(ElementId,X,Y,Callback,Duration)
		{
			Duration = Undefined(Duration,this.Duration);
			if (document.getElementById(ElementId)==null){return false;}
			if (Effects.Quality<=2){this.SetPosition(document.getElementById(ElementId),X,Y);Effects.DoCallback(Callback,null);return true;}
			var eid = Effects.GetNewId();
			Effects.CancelRepeating(ElementId,"MoveElement");
			Effects.Effects[eid] = new Array();
			Effects.Effects[eid]["Type"] = "MoveElement";
			Effects.Effects[eid]["X"] = X;
			Effects.Effects[eid]["Y"] = Y;
			Effects.Effects[eid]["Duration"] = Duration;
			Effects.Effects[eid]["ElementId"] = ElementId;
			Effects.Effects[eid]["Callback"] = Callback;
			Effects.AppendEffectObj(ElementId,eid,"MoveElement");
			this.Do(eid);
			return eid;
		},
		Do:function(EffectId)
		{
			if (!Effects.Effects[EffectId]){return;}
			var Element = document.getElementById(Effects.Effects[EffectId]["ElementId"]);
			if (!Element){return;}
			var x = Effects.Effects[EffectId]["X"];
			var y = Effects.Effects[EffectId]["Y"];
			var cx = parseFloat(Element.style.left);
			var cy = parseFloat(Element.style.top);
			var dx = x-cx;
			var dy = y-cy;
			var jx = dx/Effects.Effects[EffectId]["Duration"]*20*(6-Effects.Quality)*3;
			var jy = dy/Effects.Effects[EffectId]["Duration"]*20*(6-Effects.Quality)*3;
			if (Math.abs(dx)<=1){jx=dx;}if(Math.abs(dy)<=1){jy=dy;}
			Effects.MoveElement.SetPosition(Element,cx+jx,cy+jy);
			if (x==parseFloat(Element.style.left)&&y==parseFloat(Element.style.top))
			{Effects.CancelEffect(EffectId);return;}
			Effects.Effects[EffectId]["Timeout"] = setTimeout(function(){Effects.MoveElement.Do(EffectId);},10);
		},
		SetPosition:function(Element,X,Y)
		{
			Element.style.left = X+"px";
			Element.style.top = Y+"px";
		}
	},
	FadeElement:{
		Duration:1000,
		Start:function(ElementId,Opacity,Callback,Duration)
		{
			Duration = Undefined(Duration,this.Duration);
			if (document.getElementById(ElementId)==null){return false;}
			if (Effects.Quality==1||Duration<=35){this.SetOpacity(document.getElementById(ElementId),Opacity);Effects.DoCallback(Callback,null);return true;}
			var eid = Effects.GetNewId();
			Effects.CancelRepeating(ElementId,"FadeElement");
			Effects.Effects[eid] = new Array();
			Effects.Effects[eid]["Type"] = "FadeElement";
			Effects.Effects[eid]["Opacity"] = Opacity;
			Effects.Effects[eid]["Duration"] = Duration;
			Effects.Effects[eid]["ElementId"] = ElementId;
			Effects.Effects[eid]["Callback"] = Callback;
			Effects.AppendEffectObj(ElementId,eid,"FadeElement");
			this.Do(eid);
			return eid;
		},
		Do:function(EffectId)
		{
			if (!Effects.Effects[EffectId]){return;}
			var Element = document.getElementById(Effects.Effects[EffectId]["ElementId"]);
			if (!Element){return;}
			var o = Effects.Effects[EffectId]["Opacity"];
			var co = this.GetOpacity(Element);
			if (isNaN(co)){Effects.CancelEffect(EffectId);return;}
			var d = o-co;
			var jo = d/Effects.Effects[EffectId]["Duration"]*20*(6-Effects.Quality)*3;
			if (Math.abs(d)<=2.5){jo=d;}
			
			//allows lower duration settings without freezing/looping
			var no = co+jo;
			if (no<0) no = 0;
			else if (no>100) no = 100;
			
			this.SetOpacity(Element,no);
			if (o==no){Effects.CancelEffect(EffectId);return;}
			Effects.Effects[EffectId]["Timeout"] = setTimeout(function(){Effects.FadeElement.Do(EffectId);},10);
		},
		SetOpacity:function(Element,Opacity)
		{
			var o = Element.style;
			if (o.opacity!=undefined){o.opacity=Opacity/100;return true;}
			else if (o.filter!=undefined){o.filter="alpha(opacity="+Opacity+")";return true;}
			else if (o.KhtmlOpacity!=undefined){o.KhtmlOpacity=Opacity/100;return true;}
			else {return false;}
		},
		GetOpacity:function(Element)
		{
			var o = Element.style;
			if (o.opacity){return parseFloat(o.opacity)*100;}
			else if (o.filter){return parseFloat(o.filter.substr(14));}
			else if (o.KhtmlOpacity){return parseFloat(o.KhtmlOpacity)*100;}
			else {return 100;}
		}
	},
	ColourFadeElement:{
		Start:function(Id,StartColour,EndColour,OnUpdate,Callback)//,Duration)
		{
			var eid = Effects.GetNewId();
			Effects.CancelRepeating(Id,"ColourFadeElement");
			Effects.Effects[eid] = new Array();
			Effects.Effects[eid]["Type"] = "ColourFadeElement";
			Effects.Effects[eid]["Current"] = this.ColourToRGB(StartColour);
			Effects.Effects[eid]["End"] = this.ColourToRGB(EndColour);
			Effects.Effects[eid]["OnUpdate"] = OnUpdate;
			Effects.Effects[eid]["Callback"] = Callback;
			this.Do(eid);
			return eid;
		},
		Do:function(EffectId)
		{
			if (!Effects.Effects[EffectId]){return;}
			var ncol = this.ChangeColour(Effects.Effects[EffectId]["Current"],Effects.Effects[EffectId]["End"],Math.ceil(Effects.Quality*2));;
			if (typeof Effects.Effects[EffectId]["OnUpdate"] == 'function'){Effects.Effects[EffectId]["OnUpdate"](this.HexStyle(ncol));}
			if (this.IsEqual(ncol,Effects.Effects[EffectId]["End"]))
			{Effects.CancelEffect(EffectId);return;}
			Effects.Effects[EffectId]["Current"] = ncol;
			Effects.Effects[EffectId]["Timeout"] = setTimeout(function(){Effects.ColourFadeElement.Do(EffectId);},50);
		},
		ChangeColour:function(CurrentColour,EndColour,Offset)
		{
			var dif;
			var move;
			for (var i = 0; i < 3; i++)
			{
				dif = EndColour[i] - CurrentColour[i];
				if (dif==0)continue;
				move = Math.round(dif/Offset);
				if (Math.abs(dif)<=5)
				move = dif;
				CurrentColour[i] += move;
			}
			return CurrentColour;
		},
		ColourToRGB:function(Colour)
		{
			if (Colour==undefined || Colour==""){return [0,0,0];}
			if (Colour.substring(0,1)=="#"){Colour=Colour.substring(1);}
			if (Colour.substring(0,3)=="rgb")
			{
				var r = Colour.substring(4,Colour.indexOf(","));
				var g = Colour.substring(Colour.indexOf(",")+1,Colour.lastIndexOf(","));
				var b = Colour.substring(Colour.lastIndexOf(",")+1,Colour.indexOf(")"));
				return [parseInt(r),parseInt(g),parseInt(b)];
			}
			return [parseInt(Colour.substring(0,2), 16),parseInt(Colour.substring(2,4), 16),parseInt(Colour.substring(4,6), 16)];
		},
		D2H:function(d)
		{
			var hD = "0123456789ABCDEF";
			var h = hD.substr(d&15,1);
			while(d>15) {d>>=4;h=hD.substr(d&15,1)+h;}
			return h;
		},
		HexStyle:function(RGB)
		{
			return "#"+this.D2H(RGB[0])+this.D2H(RGB[1])+this.D2H(RGB[2]);
		},
		RGBStyle:function(RGB)
		{
			return "rgb("+RGB[0]+","+RGB[1]+","+RGB[2]+")";
		},
		IsEqual:function(RGB1,RGB2)
		{
			for (var i = 0; i < 3; i++)
			{
				if (RGB1[i]==RGB2[i]){continue;}
				else{return false;}
			}
			return true;
		}
	},
	ResizeElement:{
		Duration:1000,
		Start:function(ElementId,CenterResize,Width,Height,Callback,Duration)
		{
			Duration = Undefined(Duration,this.Duration);
			if (document.getElementById(ElementId)==null){return false;}
			if (Effects.Quality<=2||Duration<=50){this.SetSize(document.getElementById(ElementId),Width,Height);Effects.DoCallback(Callback,null);return true;}
			var eid = Effects.GetNewId();
			Effects.CancelRepeating(ElementId,"ResizeElement");
			Effects.Effects[eid] = new Array();
			Effects.Effects[eid]["Type"] = "ResizeElement";
			Effects.Effects[eid]["Width"] = Width;
			Effects.Effects[eid]["Height"] = Height;
			Effects.Effects[eid]["ElementId"] = ElementId;
			Effects.Effects[eid]["CenterResize"] = CenterResize;
			Effects.Effects[eid]["Duration"] = Duration;
			Effects.Effects[eid]["Callback"] = Callback;
			Effects.AppendEffectObj(ElementId,eid,"ResizeElement");
			this.Do(eid);
			return eid;
		},
		Do:function(EffectId)
		{
			if (!Effects.Effects[EffectId]){return;}
			var Element = document.getElementById(Effects.Effects[EffectId]["ElementId"]);
			if (Element==undefined){return;}
			var w = Effects.Effects[EffectId]["Width"];
			if (w!=null)
			{
				var cw = parseFloat(Element.style.width);
				var dw = w-cw;
				var jw = dw/Effects.Effects[EffectId]["Duration"]*20*(6-Effects.Quality)*3;
			}
			var h = Effects.Effects[EffectId]["Height"];
			if (h!=null)
			{
				var ch = parseFloat(Element.style.height);
				var dh = h-ch;
				var jh = dh/Effects.Effects[EffectId]["Duration"]*20*(6-Effects.Quality)*3;
			}
			
			if (Effects.Effects[EffectId]["CenterResize"])
			{
				if (w!=null)
				{
					var cx = parseFloat(Element.style.left);
					var jx = jw*-1/2;
					Element.style.top = cy+jy+"px";
				}
				if (h!=null)
				{
					var cy = parseFloat(Element.style.top);
					var jy = jh*-1/2;
					Element.style.left = cx+jx+"px";
				}
			}
			if (w!=null)
			if (Math.abs(dw)<=1){jw=dw;}
			if (h!=null)
			if (Math.abs(dh)<=1){jh=dh;}
			this.SetSize(Element,(w!=null?cw+jw:null),(h!=null?ch+jh:null));
			if ((w==null||w==parseFloat(Element.style.width))&&(h==null||h==parseFloat(Element.style.height)))
			{Effects.CancelEffect(EffectId);return;}
			Effects.Effects[EffectId]["Timeout"] = setTimeout(function(){Effects.ResizeElement.Do(EffectId);},10);
		},
		SetSize:function(Element,Width,Height)
		{
			if (Element==undefined){return false;}
			var o = Element.style;
			if (Width!=null)
			o.width=Width+"px";
			if (Height!=null)
			o.height=Height+"px";
			return true;
		}
	},
	NumberTransition:{
		Duration:1000,
		Start:function(Id,Start,End,OnUpdate,Callback,Duration)
		{
			var eid = Effects.GetNewId();
			Effects.CancelRepeating(Id,"NumberTransition");
			Effects.Effects[eid] = new Array();
			Effects.Effects[eid]["Type"] = "NumberTransition";
			Effects.Effects[eid]["Current"] = Start;
			Effects.Effects[eid]["End"] = End;
			Effects.Effects[eid]["ElementId"] = Id;
			Effects.Effects[eid]["Duration"] = Undefined(Duration,this.Duration);
			Effects.Effects[eid]["OnUpdate"] = OnUpdate;
			Effects.Effects[eid]["Callback"] = Callback;
			this.Do(eid);
			return eid;
		},
		Do:function(EffectId)
		{
			if (!Effects.Effects[EffectId]){return;}
			var cur = Effects.Effects[EffectId]["Current"];
			var dif = Effects.Effects[EffectId]["End"]-cur;
			cur += dif/Effects.Effects[EffectId]["Duration"]*20*(6-Effects.Quality)*3;
			if (Math.abs(dif)<=1)
			cur = Effects.Effects[EffectId]["End"];
			if (typeof Effects.Effects[EffectId]["OnUpdate"] == 'function'){Effects.Effects[EffectId]["OnUpdate"](cur);}
			if (cur == Effects.Effects[EffectId]["End"])
			{Effects.CancelEffect(EffectId);return;}
			Effects.Effects[EffectId]["Current"] = cur;
			Effects.Effects[EffectId]["Timeout"] = setTimeout(function(){Effects.NumberTransition.Do(EffectId);},10);
		}
	}
}


System.LoadNext();
