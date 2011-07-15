<?PHP
//Functions
function FS_Get_Mime_Type($filename)
{
	if (is_dir($filename)){return "text/plain";}
	$fileext = substr(strrchr($filename, '.'), 1);
	if (empty($fileext)){return "text/plain";}
	$regex = "/^([\w\+\-\.\/]+)\s+(\w+\s)*($fileext\s)/i";
	$lines = file('system/$configuration/mimetypes.cfg');
	foreach($lines as $line)
	{
		if (substr($line, 0, 1) == '#') continue; //Skip comments
		$line = rtrim($line) . " ";
		if (!preg_match($regex, $line, $matches)) continue; //Type doesn't match
		return ($matches[1]);
	}
	return "text/plain"; //Unknown type
}
function FS_Is_Hidden($string)
{
	if (substr($string,0,1)=="$"){return true;}
	return false;
}
function FS_Check_Path_Read_Access($Path)
{
	$tmpLvl=$_SESSION["Novis"]->Level;
	if (file_exists($Path))
	{
		$tmpExp = explode("/",$Path,3);
		if ($tmpLvl==1)
		{
			if ($tmpExp[1]=="users" && ($tmpExp[2]!=NULL && $tmpExp[2]!=$_SESSION["Novis"]->Name))
			{
				return false; //NO Read access to other Users directories
			}
			return true; //Standard User
		}
		elseif ($tmpLvl==2)
		{
			if ($tmpExp[1]=='$static' || $tmpExp[1]=="themes" || $tmpExp[1]=='$sound')
			{
				return true; //NO Read access to any other directory
			}
			return false; //Guest User (Not Logged In)
		}
		return true; //Admin User (Level 0)
	}
	return false; //File doesn't exist!
}
function FS_Check_Path_Write_Access($Path)
{
	$tmpLvl=$_SESSION["Novis"]->Level;
	if (FS_Check_Path_Read_Access($Path))
	{
		if ($tmpLvl==1)
		{
			$tmpExp = explode("/",$Path,3);
			if ($tmpExp[1]=='$static')
			{
				return false; //NO Write access to the $static directory
			}
			if (FS_Is_Hidden(File_Name($Path))) {return false;}
			return true; //Standard User
		}
		elseif ($tmpLvl==2)
		{
			return false; //Guest User (Not Logged In)
		}
		return true; //Level equals 0 (Admin)
	}
	return false; //NO Read access means NO Write access!
}
function FS_Get_File_Contents($Path)
{
	if (FS_Check_Path_Read_Access($Path))
	{
		if (is_file($Path))
		{
			return file_get_contents($Path);
		}
		elseif (is_dir($Path))
		{
			$Path = Add_Final_Slash($Path);
			$tmpStr="";
			$Dir=scandir($Path);
			foreach ($Dir as $element)
			{
				if ($element!="." && $element!=".." && $element!=".htaccess" && FS_Is_Hidden($element)==false)
				{
					$tmpStr=$tmpStr.FS_Get_File_Info($Path.$element);
				}
			}
			return $tmpStr;
		}
	}
	return false;
}
function FS_Put_File_Contents($Path,$Contents)
{
	if (FS_Check_Path_Write_Access(Parent_Directory($Path)))
	{
		file_put_contents($Path,$Contents);
		return true;
	}
	return false;
}
function FS_Create_Directory($Path)
{
	if (FS_Check_Path_Write_Access(Parent_Directory(Remove_Final_Slash($Path))))
	{
		mkdir($Path);
		return true;
	}
	return false;
}
function FS_Remove_Directory($Path)
{
	if (FS_Check_Path_Write_Access($Path))
	{
		rmdir($Path);
		return true;
	}
	return false;
}
function FS_Remove_File($Path)
{
	if (FS_Check_Path_Write_Access($Path))
	{
		unlink($Path);
		return true;
	}
	return false;
}
function FS_Get_File_Info($Path)
{
	if (FS_Check_Path_Read_Access($Path))
	{
		if (is_dir($Path))
		{
			$Ext="";
		}
		elseif (is_file($Path))
		{
			$tmpPos=strripos(File_Name($Path),".");
			if ($tmpPos!=-1)
			{
				$Ext=substr(File_Name($Path),$tmpPos+1);
			}
			else
			{
				$Ext=strtoupper(File_Name($Path));
			}
		}
		else {return NULL;}
		clearstatcache();
		return "[".File_Name($Path)."|".$Ext."|".$Path."|".filesize($Path)."|".
						date("D, d M Y H:i:s", filectime($Path))."|".
						date("D, d M Y H:i:s", filemtime($Path))."|".
						date("D, d M Y H:i:s", fileatime($Path))."]";
	}
	return NULL;
}
//Basic Settings
$Path = Shorten_Path(Decode($_GET["path"]));
if ($_GET["type"]=="config"){ $Path=$Config."/".$Path; }
if ($_GET["type"]=="apps"){ $Path=$Config."/apps/".$Path; }
if ($_GET["type"]=="sound"){ $Path=$Sound."/".$Path; if ($_GET["encode"]==NULL){$_GET["encode"]="false";}}
if ($_GET["type"]=="static"){ $Path=$Static."/".$Path; if ($_GET["encode"]==NULL){$_GET["encode"]="false";}}
if ($_GET["type"]=="themes"){ $Path=$Themes."/".$Path; if ($_GET["encode"]==NULL){$_GET["encode"]="false";}}
if ($_GET["type"]=="ctheme"){ $Path=$Themes."/".$_SESSION["Novis"]->Theme."/".$Path; if ($_GET["encode"]==NULL){$_GET["encode"]="false";}}
if ($_GET["type"]=="home"){ $Path=$_SESSION["Novis"]->HomeDir."/".$Path; }
//Plugs
if ($_GET["action"]=="fs-get")
{
	$result = FS_Get_File_Contents($Path);
	if ($result!=false)
	{
		$mtype = FS_Get_Mime_Type($Path);
		if ($_POST["ctype"]!="false")
		{
			header("Content-Type: ".$mtype);
		}
		clearstatcache();
		header("Content-Length: ".filesize($Path));
		if ($_GET["encode"]!="false")
		{
			$result = Encode($result);
		}
		echo $result;
		CodeExit();
	}
}
elseif ($_GET["action"]=="fs-put")
{
	header("Content-Type: text/plain");
	$result = FS_Put_File_Contents($Path,Decode($_POST["contents"]));
	if ($result)
	{
		echo "true";
		CodeExit();
	}
	echo "false";
	CodeExit();
}
elseif ($_GET["action"]=="fs-download")
{
	$result = FS_Get_File_Contents($Path);
	if ($result!=false)
	{
		$mtype = FS_Get_Mime_Type($Path);
		header("Content-Type: ".$mtype);
		clearstatcache();
		header("Content-Length: ".filesize($Path));
		header("Content-Disposition: attachment; filename=\"".substr($Path,(strrpos($Path,"/")+1)).'"');
		echo $result;
		CodeExit();
	}
}
elseif ($_GET["action"]=="fs-info")
{
	$tmpInfo = FS_Get_File_Info($Path);
	header("Content-Length: ".strlen($tmpInfo));
	echo Encode($tmpInfo);
	CodeExit();
}
elseif ($_GET["action"]=="fs-hash")
{
	if (is_file($Path))
	{
		$result = FS_Get_File_Contents($Path);
		if ($result!=false)
		{
			$hash = sha1($result);
			header("Content-Length: ".strlen($hash));
			echo $hash;
			CodeExit();
		}
	}
}
elseif ($_GET["action"]=="fs-theme-install")
{
	//Uses $URL ($_GET["URL"]) for the theme path
	//CHECK USER LEVEL
}
elseif ($_GET["action"]=="fs-theme-uninstall")
{
	//Uses $Path for the theme path
	//CHECK USER LEVEL
}
elseif ($_GET["action"]=="fs-app-install")
{
	//Uses $URL ($_GET["URL"]) OR $Path for the app path
	//CHECK USER LEVEL
}
elseif ($_GET["action"]=="fs-app-uninstall")
{
	//Uses $Path for the app path
	//CHECK USER LEVEL
}
elseif ($_GET["action"]=="fs-app-update")
{
	//Uses $Path (File to Overwrite)
	//return True if updated
	//return False on fail and on no update
	//CHECK USER LEVEL
}
elseif ($_GET["action"]=="fs-novis-update")
{
	//include("http://www.turnersoftware.au.com/update.php?app=novis&version=$FullVersion"); ?????????????
	//return True if update
	//return False on fail and on no update
	//CHECK USER LEVEL
}
?>