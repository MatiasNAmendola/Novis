//Novis UI Controls

//Simple Button
System.Controls.Button = {
	Init:false,
	New:function(Parent,Id,Text,OnClick)
	{
		if (!System.Controls.Button.Init){System.Loader.LoadCSS("client/controls/button/style.css",function(){System.Controls.Button.Init=true;});}
		var btn = document.createElement("span");
		btn.id = Id;
		btn.className = "Button Button-Webkit";
		btn.innerHTML = "<span class='Inner-Button'></span>";
		btn.ChangeText = function(Text)
		{
			btn.title = Text;
			btn.children[0].innerHTML = Text;
		}
		btn.Remove = function(){Parent.removeChild(btn);}
		btn.onclick = OnClick;
		System.Controls.Styling.BorderRadius.Set(btn,"5px");
		btn.ChangeText(Text);
		Parent.appendChild(btn);
	}
}

//Icon
System.Controls.Icon = {
	Init:false,
	New:function(Parent,Id,ImageSrc,Text,OnClick)
	{
		if (!System.Controls.Icon.Init){System.Loader.LoadCSS("client/controls/icon/style.css",function(){System.Controls.Icon.Init=true;});}
		var ico = document.createElement("div");
		ico.id = Id;
		ico.className = "Icon Icon-Webkit";
		ico.innerHTML = "<img class='Icon-Image' src='"+ImageSrc+"' /><span class='Icon-Text'></span>";
		ico.ChangeText = function(Text)
		{
			ico.title = Text;
			ico.children[0].alt = Text;
			ico.children[1].innerHTML = Text;
		}
		ico.Move = function(X,Y)
		{
			ico.style.left = X+"px";
			ico.style.top = Y+"px";
		}
		ico.Resize = function(Width,Height)
		{
			ico.style.width = Width+"px";
			ico.style.height = Height+"px";
			ico.children[0].style.height = Height-16+"px";
		}
		ico.Remove = function(){Parent.removeChild(ico);}
		ico.onclick = OnClick;
		System.Controls.Styling.BorderRadius.Set(ico,"5px");
		ico.ChangeText(Text);
		ico.Resize(64,64);
		Parent.appendChild(ico);
	}
}

//List
//WORK IN PROGRESS!
/*
 * TODO
 * Fix Row/Col position for each Row/Col when a new one is added/removed
 * Fix CSS to display each row as a set size rather than stretching
 * 
 */
System.Controls.List = {
	Init:false,
	New:function(Parent,Id,OnSelect)
	{
		if (!System.Controls.List.Init){System.Loader.LoadCSS("client/controls/list/style.css");System.Controls.List.Init=true;}
		var list = document.createElement("div");
		list.id = Id;
		list.className = "List";
		list.innerHTML = "<table class='List-Table'></table>";
		list.Internal = {Cols:1,Rows:0,SelectedItem:null}
		list.AddCol = function(Position)
		{
			var rows = list.children[0].rows;
			var cell;
			for (var i = 0; i < list.Internal.Rows; i++)
			{
				cell = rows[i].insertCell(Position);
				cell.Col = Position;
				cell.onclick = list.OnSelect;
			}
			return true;
		}
		list.AddRow = function(RowData,Position)
		{
			Position = System.Misc.Undefined(Position,list.GetRows());
			if (!System.Misc.IsInbetween(Position,0,list.GetRows()))
			return false;
			var row = list.children[0].insertRow(Position);
			var cell;
			for (var i = 0; i < list.Internal.Cols; i++)
			{
				if (i<RowData.length)
				{
					cell = row.insertCell(row.cells.length);
					cell.innerHTML=RowData[i];
				}
				else
				{
					cell = row.insertCell(row.cells.length);
				}
				cell.Col = i;
				cell.onclick = list.OnSelect;
			}
			row.Row = Position;
			row.className = "List-Item";
			list.Internal.Rows++;
			return Position;
		}
		list.RemoveRow = function(Row)
		{
			if (list.GetRows()<=0||!System.Misc.IsInbetween(Row,0,list.GetRows()-1))
			return false;
			list.children[0].removeRow(Row);
			list.Internal.Rows--;
			return true;
		}
		list.RemoveCol = function(Col)
		{
			if (list.GetCols()<=0||!System.Misc.IsInbetween(Col,0,list.GetCols()-1))
			return false;
			var rows = list.children[0].rows;
			for (var i = 0; i < list.Internal.Rows; i++)
			{
				rows[i].removeCell(Col);
			}
			list.Internal.Cols--;
			return true;
		}
		list.ChangeText = function(Row,Col,Text)
		{
			if (list.GetCols()<=0||!System.Misc.IsInbetween(Col,0,list.GetCols()-1))
			if (list.GetRows()<=0||!System.Misc.IsInbetween(Row,0,list.GetRows()-1))
			return false;
			var cell = list.children[0].rows[Row].cells[Col];
			cell.innerHTML = Text;
			cell.title = Text;
		}
		list.Resize = function(Width,Height)
		{
			list.style.width = Width+"px";
			list.style.height = Height+"px";
		}
		list.GetSelectedItem = function()
		{
			return list.Internal.SelectedItem;
		}
		list.OnSelect = function(Event)
		{
			list.Internal.SelectedItem = Event.currentTarget.parentNode;
			if (System.Misc.IsFunction(OnSelect))
			OnSelect(Event.currentTarget.parentNode.Row,Event.currentTarget.Col);
		}
		list.GetRows = function(){return list.Internal.Rows}
		list.GetCols = function(){return list.Internal.Cols}
		list.Remove = function(){Parent.removeChild(list);}
		list.Resize(250,100);
		Parent.appendChild(list);
	}
}

//Loading Bar
System.Controls.LoadingBar = {
	New:function(Parent,Id,Text)
	{
		var bar = document.createElement("img");
		bar.id = Id;
		bar.src = "client/controls/loadingbar/loading.gif";
		bar.Resize = function(Width,Height)
		{
			bar.style.width = Width+"px";
			bar.style.height = Height+"px";
		}
		bar.Remove = function(){Parent.removeChild(bar);}
		bar.Resize(220,19);
		Parent.appendChild(bar);
	}
}

//Wide Text Box
System.Controls.WideTextBox = {
	Init:false,
	New:function(Parent,Id,Text,RoundedBorder)
	{
		if (!System.Controls.Button.Init){System.Loader.LoadCSS("client/controls/widetextbox/style.css",function(){System.Controls.WideTextBox.Init=true;});}
		var txt = document.createElement("span");
		txt.id = Id;
		txt.className = "Wide-Text-Box";
		txt.Remove = function(){Parent.removeChild(txt);}
		if (RoundedBorder)
		System.Controls.Styling.BorderRadius.Set(txt,"5px");
		Parent.appendChild(txt);
	}
}
