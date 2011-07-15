<?PHP
session_start();

//NOTE: Some functions on this page are either created for or inspired by Iteva 0.7
//		Iteva is created by Thomas Hearing

//Check Path Permission
//Inspired from Iteva 0.7 charparse.php
//Modified by James Turner
function CheckPathPermission($Path)
{
	$ExplodedPath=explode("/","../".$Path);
	$ExplodedHomePath=explode("/","../users/".$_SESSION["user"]."/desktop/");
	$Position=0;
	//Debug Line
	//echo "../".$Path." vs ../users/".$_SESSION["user"]."/desktop/\n";
	for ($Position=0; $Position<count($ExplodedHomePath)-1; $Position++)
	{
		//Debug Line
		//echo $ExplodedPath[$Position]." == ".$ExplodedHomePath[$Position]."\n";
		if ($ExplodedPath[$Position]!=$ExplodedHomePath[$Position]) {return false;}
	}
	return CheckPathDepth($Path);
}

//Depth Checking Path Permission
//Inspired from Iteva 0.7 charparse.php
//Modified by James Turner
function CheckPathDepth($Path)
{
	$ExplodedPath=explode("/",$Path);
	$Depth=-4;
	$Position=0;
	for ($Position=0; $Position<count($ExplodedPath)-1; $Position++)
	{
		if ($ExplodedPath[$Position]=="." || $ExplodedPath[$Position]=="")
		{
			//Do nothing
		}
		elseif ($ExplodedPath[$Position]=="..")
		{
			if ($Depth<0)
			{
				return false;
			}
			$Depth--;
		}
		else
		{
			$Depth++;
		}
	}
	return true;
}

//String Parse Function
//Created by Thomas Hearing for Iteva
function StringParse($InputString)
{
	$InputString=str_replace("/","",$InputString);
	$InputString=str_replace("\\","",$InputString);
	$InputString=str_replace(":","",$InputString);
	$InputString=str_replace("*","",$InputString);
	$InputString=str_replace("?","",$InputString);
	$InputString=str_replace("\"","",$InputString);
	$InputString=str_replace("<","",$InputString);
	$InputString=str_replace(">","",$InputString);
	$InputString=str_replace("|","",$InputString);
	return $InputString;
}
		
?>