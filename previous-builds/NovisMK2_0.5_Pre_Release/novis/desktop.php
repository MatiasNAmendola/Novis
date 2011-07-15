<?PHP
session_start();
//Check if Logged In
if ($_SESSION["user"]==NULL)
{
echo "401|";
exit;
}

//Get Permission Functions
require("permissions.php");

//Constants
$settingsPath="../users/".$_SESSION["user"]."/settings/";

//Trim Common
$_GET["path"]=trim($_GET["path"]);
$_POST["path"]=trim($_POST["path"]);
$_POST["name"]=trim($_POST["name"]);
$_POST["contents"]=trim($_POST["contents"]);



//Gets the uploaded file and moves it to the server!
if ($_GET["action"]=="upload")
{
	if(@move_uploaded_file($_FILES['Panel-Uploader-File']['tmp_name'], "../users/".$_SESSION["user"]."/desktop/".basename($_FILES['Panel-Uploader-File']['name'])))
	{
		sleep(1);
		echo '<script language="javascript" type="text/javascript">window.top.Core.Panel.Controls.Uploader.StopUpload("201|");</script>';
	}
	else
	{
		sleep(1);
		echo '<script language="javascript" type="text/javascript">window.top.Core.Panel.Controls.Uploader.StopUpload("500|");</script>';
	}
}

//Retrieves the file from the server for user to download
if ($_GET["action"]=="download")
{
	if (CheckPathPermission($_GET["file"])==false) {exit;}
	else
	{
		if (file_exists("../".$_GET["file"]))
		{
			header('Content-type: application/');
			header("Content-Disposition: attachment; filename=\"".substr($_GET["file"],(strrpos($_GET["file"],"/")+1)).'"');
			echo file_get_contents("../".$_GET["file"]);
		}
	}
}

//Gets the timestamp of the file
if ($_GET["action"]=="timestamp")
{
	if (CheckPathPermission($_POST["path"])==false || file_exists("../".$_POST["path"])==false) {echo "403|"; exit;}
	echo "200|".filectime("../".$_POST["path"]);
}

//Gets file contents for HTML Access
if ($_GET["action"]=="load")
{
	//Scrap this and use method below
	if (CheckPathPermission($_GET["path"])==false) {exit;}
	$path="../".$_GET["path"];
	if (file_exists($path))
	{
	echo file_get_contents($path);
	exit;
	}
	exit;
}

//Gets file contents of contents of folder
if ($_GET["action"]=="get")
{
	if (CheckPathPermission($_POST["path"])==false) {echo "403|"; exit;}
	$path="../".$_POST["path"];
	
	//Quick No Slash Directory Fix
	if (substr($path,strlen($path)-1)!="/" && is_dir($path)) {$path=$path."/";}
	
	if (file_exists($path))
	{
		if (is_dir($path))
		{
		echo "200|";
		$TmpStr="";
		$Dir=scandir($path);
		foreach ($Dir as $element)
			{
			if ($element!="." && $element!=".." && $element!=".htaccess")
				{
				$TmpStr=$TmpStr."|";
				if (is_dir($path.$element))
					{
					$TmpStr=$TmpStr."D|".$_POST["path"].$element."|".$element."|dir";
					}
				if (is_file($path.$element))
					{
					$TmpStr=$TmpStr."F|".$_POST["path"].$element."|".$element."|".substr($element,strripos($element,"."));
					}
				}
			}
		echo str_replace("+","%20",urlencode($TmpStr));
		exit;
		}
		elseif (is_file($path))
		{
		echo "200|".str_replace("+","%20",urlencode(file_get_contents($path)));
		exit;
		}
	}
	echo "404|";
	exit;
}

//Checks if file exists
if ($_GET["action"]=="chk")
{
	if (CheckPathPermission($_POST["path"])==false) {echo "403|"; exit;}
	if (file_exists($_POST["path"]))
	{
	echo "200|true";
	exit;
	}
	echo "200|false";
	exit;
}

if ($_GET["action"]=="per")
{
	if (CheckPathPermission($_POST["path"]))
	{
	echo "200|true";
	exit;
	}
	echo "200|false";
	exit;
}

//Writes to file or creates new folder
if ($_GET["action"]=="put")
{
	if (CheckPathPermission($_POST["path"])==false) {echo "403|"; exit;}
	if ($_POST["type"]=="dir")
	{
		if (!(file_exists($_POST["path"])))
		{
		mkdir($_POST["path"]);
		file_put_contents($_POST["path"]."/.htaccess","DENY FROM ALL");
		echo "201|";
		}
		else {echo "409|";}
	exit;
	}
	else
	{	echo "204|";
		file_put_contents($_POST["path"],$_POST["contents"]);
	}
	exit;
}

//Read/Write Settings
if ($_GET["action"]=="settings")
{
	if ($_POST["type"]=="read")
	{
		$_POST["name"]=StringParse($_POST["name"]);
		if (file_exists($settingsPath.$_POST["name"].".cfg"))
		{
			echo "200|".str_replace("+","%20",urlencode(file_get_contents($settingsPath.$_POST["name"].".cfg")));
			exit;
		}
		echo "404|";
		exit;
	}
	else
	{
		file_put_contents($settingsPath.$_POST["name"].".cfg",$_POST["contents"]);
		echo "204|";
	}
	exit;
}

//Read/Write System Wide Settings
if ($_GET["action"]=="syssettings")
{
	if ($_POST["type"]=="read")
	{
		$_POST["name"]=StringParse($_POST["name"]);
		if (file_exists("system/settings/".$_POST["name"].".cfg"))
		{
			echo "200|".str_replace("+","%20",urlencode(file_get_contents("system/settings/".$_POST["name"].".cfg")));
			exit;
		}
		echo "404|";
		exit;
	}
	else
	{
		file_put_contents("system/settings/".$_POST["name"].".cfg",$_POST["contents"]);
		echo "204|";
	}
	exit;
}

//Returns list of installed themes
if ($_GET["action"]=="themes")
{
	$themes = scandir("system/themes");
	echo "200|";
	$tmpstr = "|";
	foreach($themes as $theme)
	{
		if ($theme!="." && $theme!=".." && is_file("system/themes/".$theme))
		{
			$tmpstr=$tmpstr.$theme."|";
		}
	}
	echo str_replace("+","%20",urlencode($tmpstr));
}
?>