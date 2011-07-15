//Novis Effects Engine
//Tweaked version of the Simple Element Effects

//Might need to rework how it cancels repeating effects as it still needs to loop through a million undefined effect objects
//which, over time, would slow down the performance of Novis. Consider using foreach instead and use the effectid as a string
//not a number.

//Also, might overhaul to use a dom object rather then a element id as some elements might not have a element id.

System.Controls.Effects={
	Effects:new Array(),
	/* 5 = Full | 4 = Slightly Faster (less moves) | 3 = More jerky movements | 2 = Drop all sliding | 1 = Drop all fading */
	Quality:5,
	CancelEffect:function(Id)
	{
		if (!System.Controls.Effects.Effects[Id]){return false;}
		clearTimeout(System.Controls.Effects.Effects[Id]["Timeout"]);
		delete System.Controls.Effects.Effects[Id];
		return true;
	},
	CancelRepeating:function(ElementId,Type)
	{
		for (var i = 0; i < System.Controls.Effects.Effects.length; i++)
		{
			if (System.Controls.Effects.Effects[i]!=undefined&&System.Controls.Effects.Effects[i]["ElementId"]==ElementId&&System.Controls.Effects.Effects[i]["Type"]==Type)
			{
				System.Controls.Effects.CancelEffect(i);
				return true;
			}
		}
		return false;
	},
	DoCallback:function(Callback,EffectId)
	{
		if (Callback!=undefined&&Callback!=null)
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
			if (document.getElementById(ElementId)==undefined){return false;}
			if (System.Controls.Effects.Quality<=2){System.Controls.Effects.MoveElement.SetPosition(document.getElementById(ElementId),X,Y);System.Controls.Effects.DoCallback(Callback,null);return true;}
			var eid = System.Controls.Effects.Effects.length;
			System.Controls.Effects.CancelRepeating(ElementId,"MoveElement");
			System.Controls.Effects.Effects[eid] = new Array();
			System.Controls.Effects.Effects[eid]["Type"] = "MoveElement";
			System.Controls.Effects.Effects[eid]["X"] = X;
			System.Controls.Effects.Effects[eid]["Y"] = Y;
			System.Controls.Effects.Effects[eid]["Duration"] = System.Misc.Undefined(Duration,System.Controls.Effects.MoveElement.Duration);
			System.Controls.Effects.Effects[eid]["ElementId"] = ElementId;
			System.Controls.Effects.Effects[eid]["Callback"] = Callback;
			System.Controls.Effects.MoveElement.Do(eid);
			return eid;
		},
		Do:function(EffectId)
		{
			if (!System.Controls.Effects.Effects[EffectId]){return;}
			var Element = document.getElementById(System.Controls.Effects.Effects[EffectId]["ElementId"]);
			if (!Element){return;}
			var x = System.Controls.Effects.Effects[EffectId]["X"];
			var y = System.Controls.Effects.Effects[EffectId]["Y"];
			var cx = parseFloat(Element.style.left);
			var cy = parseFloat(Element.style.top);
			var dx = x-cx;
			var dy = y-cy;
			var jx = dx/System.Controls.Effects.Effects[EffectId]["Duration"]*20*(6-System.Controls.Effects.Quality)*3;
			var jy = dy/System.Controls.Effects.Effects[EffectId]["Duration"]*20*(6-System.Controls.Effects.Quality)*3;
			if (Math.abs(dx)<=1){jx=dx;}if(Math.abs(dy)<=1){jy=dy;}
			System.Controls.Effects.MoveElement.SetPosition(Element,cx+jx,cy+jy);
			if (x==parseFloat(Element.style.left)&&y==parseFloat(Element.style.top)){if(System.Controls.Effects.Effects[EffectId]["Callback"]!=undefined){System.Controls.Effects.Effects[EffectId]["Callback"](System.Controls.Effects.Effects[EffectId]["ElementId"],true);}System.Controls.Effects.CancelEffect(EffectId);return;}
			System.Controls.Effects.Effects[EffectId]["Timeout"] = setTimeout(function(){System.Controls.Effects.MoveElement.Do(EffectId);},10);
		},
		SetPosition:function(Element,X,Y)
		{
			Element.style.left = X+"px";
			Element.style.top = Y+"px";
		},
	},
	FadeElement:{
		Duration:1000,
		Start:function(ElementId,Opacity,Callback,Duration)
		{
			if (document.getElementById(ElementId)==undefined){return false;}
			if (System.Controls.Effects.Quality==1){System.Controls.Effects.FadeElement.SetOpacity(document.getElementById(ElementId),Opacity);System.Controls.Effects.DoCallback(Callback,null);return true;}
			var eid = System.Controls.Effects.Effects.length;
			System.Controls.Effects.CancelRepeating(ElementId,"FadeElement");
			System.Controls.Effects.Effects[eid] = new Array();
			System.Controls.Effects.Effects[eid]["Type"] = "FadeElement";
			System.Controls.Effects.Effects[eid]["Opacity"] = Opacity;
			System.Controls.Effects.Effects[eid]["Duration"] = System.Misc.Undefined(Duration,System.Controls.Effects.FadeElement.Duration);
			System.Controls.Effects.Effects[eid]["ElementId"] = ElementId;
			System.Controls.Effects.Effects[eid]["Callback"] = Callback;
			System.Controls.Effects.FadeElement.Do(eid);
			return eid;
		},
		Do:function(EffectId)
		{
			if (!System.Controls.Effects.Effects[EffectId]){return;}
			var Element = document.getElementById(System.Controls.Effects.Effects[EffectId]["ElementId"]);
			if (!Element){return;}
			var o = System.Controls.Effects.Effects[EffectId]["Opacity"];
			var co = System.Controls.Effects.FadeElement.GetOpacity(Element);
			if (isNaN(co)){System.Controls.Effects.CancelEffect(EffectId);return;}
			var d = o-co;
			var jo = d/System.Controls.Effects.Effects[EffectId]["Duration"]*20*(6-System.Controls.Effects.Quality)*3;
			if (Math.abs(d)<=2.5){jo=d;}
			System.Controls.Effects.FadeElement.SetOpacity(Element,co+jo);
			if (o==co+jo){if(System.Controls.Effects.Effects[EffectId]["Callback"]!=undefined){System.Controls.Effects.Effects[EffectId]["Callback"](System.Controls.Effects.Effects[EffectId]["ElementId"],true);}System.Controls.Effects.CancelEffect(EffectId);return;}
			System.Controls.Effects.Effects[EffectId]["Timeout"] = setTimeout(function(){System.Controls.Effects.FadeElement.Do(EffectId);},10);
		},
		SetOpacity:function(Element,Opacity)
		{
			var o = Element.style;
			if (o.filter!=undefined){o.filter="alpha(opacity="+Opacity+")";return true;}
			else if (o.opacity!=undefined){o.opacity=Opacity/100;return true;}
			else if (o.KhtmlOpacity!=undefined){o.KhtmlOpacity=Opacity/100;return true;}
			else {return false;}
		},
		GetOpacity:function(Element)
		{
			var o = Element.style;
			if (o.filter){return parseFloat(o.filter.substr(14));}
			else if (o.opacity){return parseFloat(o.opacity)*100;}
			else if (o.KhtmlOpacity){return parseFloat(o.KhtmlOpacity)*100;}
			else {return 100;}
		},
	},
	//Might update so rather then modifying the colour of the object itself, it sends the new color to a user defined function.
	//This allows greater uses of the effects
	ColourFadeElement:{
		Duration:250,
		Start:function(ElementId,Colour,Callback,Duration)
		{
			if (document.getElementById(ElementId)==undefined){return false;}
			if (System.Controls.Effects.Quality==1){document.getElementById(ElementId).style.backgroundColor=Colour;System.Controls.Effects.DoCallback(Callback,null);return true;}
			var eid = System.Controls.Effects.Effects.length;
			System.Controls.Effects.CancelRepeating(ElementId,"ColourFadeElement");
			System.Controls.Effects.Effects[eid] = new Array();
			System.Controls.Effects.Effects[eid]["Type"] = "ColourFadeElement";
			System.Controls.Effects.Effects[eid]["Colour"] = System.Controls.Effects.ColourFadeElement.ColourToRGB(Colour);
			System.Controls.Effects.Effects[eid]["Duration"] = System.Misc.Undefined(Duration,System.Controls.Effects.ColourFadeElement.Duration);
			System.Controls.Effects.Effects[eid]["ElementId"] = ElementId;
			System.Controls.Effects.Effects[eid]["Callback"] = Callback;
			System.Controls.Effects.ColourFadeElement.Do(eid);
			return eid;
		},
		Do:function(EffectId)
		{
			if (!System.Controls.Effects.Effects[EffectId]){return;}
			var Element = document.getElementById(System.Controls.Effects.Effects[EffectId]["ElementId"]);
			if (!Element){return;}
			var c = System.Controls.Effects.Effects[EffectId]["Colour"];
			var cc = System.Controls.Effects.ColourFadeElement.ColourToRGB(Element.style.backgroundColor);
			if (System.Controls.Effects.ColourFadeElement.IsEqual(c,cc)){if(System.Controls.Effects.Effects[EffectId]["Callback"]!=undefined){System.Controls.Effects.Effects[EffectId]["Callback"](System.Controls.Effects.Effects[EffectId]["ElementId"]);}System.Controls.Effects.CancelEffect(EffectId);return;}
			var nc = System.Controls.Effects.ColourFadeElement.NextRGB(cc,c,10/System.Controls.Effects.Effects[EffectId]["Duration"]*20*(6-System.Controls.Effects.Quality)*3);
			Element.style.backgroundColor = System.Controls.Effects.ColourFadeElement.RGBStyle(nc);
			System.Controls.Effects.Effects[EffectId]["Timeout"] = setTimeout(function(){System.Controls.Effects.ColourFadeElement.Do(EffectId);},10);
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
		NextRGB:function(RGB1,RGB2,Interval)
		{
			var RGB = new Array();
			for (var i = 0; i < 3; i++)
			{
				if (RGB1[i]==RGB2[i]){RGB[i]=RGB1[i]; continue;}
				if (Math.max(RGB1[i],RGB2[i])-Math.min(RGB1[i],RGB2[i])<Interval){RGB[i]=RGB2[i];continue;}
				if (RGB1[i]<RGB2[i])
				{
					RGB[i]=RGB1[i]+Interval;
					continue;
				}
				else if (RGB1[i]>RGB2[i])
				{
					RGB[i]=RGB1[i]-Interval;
					continue;
				}
			}
			return RGB;
		},
		IsEqual:function(RGB1,RGB2)
		{
			for (var i = 0; i < 3; i++)
			{
				if (RGB1[i]==RGB2[i]){continue;}
				else{return false;}
			}
			return true;
		},
		RGBStyle:function(RGB)
		{
			return "rgb("+RGB[0]+","+RGB[1]+","+RGB[2]+")";
		},
	},
	ResizeElement:{
		Duration:1000,
		Start:function(ElementId,CenterResize,Width,Height,Callback,Duration)
		{
			if (document.getElementById(ElementId)==undefined){return false;}
			if (System.Controls.Effects.Quality<=2){System.Controls.Effects.ResizeElement.SetSize(document.getElementById(ElementId),Width,Height);System.Controls.Effects.DoCallback(Callback,null);return true;}
			var eid = System.Controls.Effects.Effects.length;
			System.Controls.Effects.CancelRepeating(ElementId,"ResizeElement");
			System.Controls.Effects.Effects[eid] = new Array();
			System.Controls.Effects.Effects[eid]["Type"] = "ResizeElement";
			System.Controls.Effects.Effects[eid]["Width"] = Width;
			System.Controls.Effects.Effects[eid]["Height"] = Height;
			System.Controls.Effects.Effects[eid]["ElementId"] = ElementId;
			System.Controls.Effects.Effects[eid]["CenterResize"] = CenterResize;
			System.Controls.Effects.Effects[eid]["Duration"] = System.Misc.Undefined(Duration,System.Controls.Effects.ResizeElement.Duration);
			System.Controls.Effects.Effects[eid]["Callback"] = Callback;
			System.Controls.Effects.ResizeElement.Do(eid);
			return eid;
		},
		Do:function(EffectId)
		{
			if (!System.Controls.Effects.Effects[EffectId]){return;}
			var Element = document.getElementById(System.Controls.Effects.Effects[EffectId]["ElementId"]);
			if (Element==undefined){return;}
			var w = System.Controls.Effects.Effects[EffectId]["Width"];
			var h = System.Controls.Effects.Effects[EffectId]["Height"];
			var cw = parseFloat(Element.style.width);
			var ch = parseFloat(Element.style.height);
			var dw = w-cw;
			var dh = h-ch;
			var jw = dw/System.Controls.Effects.Effects[EffectId]["Duration"]*20*(6-System.Controls.Effects.Quality)*3;
			var jh = dh/System.Controls.Effects.Effects[EffectId]["Duration"]*20*(6-System.Controls.Effects.Quality)*3;
			if (System.Controls.Effects.Effects[EffectId]["CenterResize"])
			{
				var cx = parseFloat(Element.style.left);
				var cy = parseFloat(Element.style.top);
				var jx = jw*-1/2;
				var jy = jh*-1/2;
				Element.style.left = cx+jx+"px";
				Element.style.top = cy+jy+"px";
			}
			if (Math.abs(dw)<=1){jw=dw;}if(Math.abs(dh)<=1){jh=dh;}
			System.Controls.Effects.ResizeElement.SetSize(Element,cw+jw,ch+jh);
			if (w==parseFloat(Element.style.width)&&h==parseFloat(Element.style.height)){if(System.Controls.Effects.Effects[EffectId]["Callback"]!=undefined){System.Controls.Effects.Effects[EffectId]["Callback"](System.Controls.Effects.Effects[EffectId]["ElementId"],true);}System.Controls.Effects.CancelEffect(EffectId);return;}
			System.Controls.Effects.Effects[EffectId]["Timeout"] = setTimeout(function(){System.Controls.Effects.ResizeElement.Do(EffectId);},10);
		},
		SetSize:function(Element,Width,Height)
		{
			if (Element==undefined){return false;}
			var o = Element.style;
			o.width=Width+"px";
			o.height=Height+"px";
			return true;
		},
	},
	NumberTransition:{
		Duration:1000,
		Start:function(Id,Start,End,OnUpdate,Callback,Duration)
		{
			var eid = System.Controls.Effects.Effects.length;
			System.Controls.Effects.CancelRepeating(Id,"NumberTransition");
			System.Controls.Effects.Effects[eid] = new Array();
			System.Controls.Effects.Effects[eid]["Type"] = "NumberTransition";
			System.Controls.Effects.Effects[eid]["Current"] = Start;
			System.Controls.Effects.Effects[eid]["End"] = End;
			System.Controls.Effects.Effects[eid]["ElementId"] = Id;
			System.Controls.Effects.Effects[eid]["Duration"] = System.Misc.Undefined(Duration,System.Controls.Effects.NumberTransition.Duration);
			System.Controls.Effects.Effects[eid]["OnUpdate"] = OnUpdate;
			System.Controls.Effects.Effects[eid]["Callback"] = Callback;
			System.Controls.Effects.NumberTransition.Do(eid);
			return eid;
		},
		Do:function(EffectId)
		{
			if (!System.Controls.Effects.Effects[EffectId]){return;}
			var cur = System.Controls.Effects.Effects[EffectId]["Current"];
			var dif = System.Controls.Effects.Effects[EffectId]["End"]-cur;
			cur += dif/System.Controls.Effects.Effects[EffectId]["Duration"]*20*(6-System.Controls.Effects.Quality)*3;
			if (Math.abs(dif)<=1)
			cur = System.Controls.Effects.Effects[EffectId]["End"];
			if (typeof System.Controls.Effects.Effects[EffectId]["OnUpdate"] == 'function'){System.Controls.Effects.Effects[EffectId]["OnUpdate"](cur);}
			if (cur == System.Controls.Effects.Effects[EffectId]["End"]){if(System.Controls.Effects.Effects[EffectId]["Callback"]!=undefined){System.Controls.Effects.Effects[EffectId]["Callback"](System.Controls.Effects.Effects[EffectId]["ElementId"],true);}System.Controls.Effects.CancelEffect(EffectId);return;}
			System.Controls.Effects.Effects[EffectId]["Current"] = cur;
			System.Controls.Effects.Effects[EffectId]["Timeout"] = setTimeout(function(){System.Controls.Effects.NumberTransition.Do(EffectId);},10);
		}
	}
}
