//Novis String Parsing Function

System.Parse={
	ConfigFile:function(Text,CodeFile)
	{
		var Conf;
		var CurrentLine;
		var ConfData=new Array();
		var SplitLine;
		if (CodeFile)
		Conf=Text.slice(0,Text.indexOf("Code::"));
		Conf=Text.split("\n");
		for (CurrentLine in Conf)
		{
			if (Conf[CurrentLine]!="" && Conf[CurrentLine].indexOf("//")!=0)
			{
				SplitLine=Conf[CurrentLine].split("::");
				ConfData[SplitLine[0].replace(/^\s+|\s+$/g,'')]=SplitLine[1].replace(/^\s+|\s+$/g,'');
			}
		}
		return ConfData;
	}
}
