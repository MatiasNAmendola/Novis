<?PHP
error_reporting(E_ALL ^ E_NOTICE);
//Novis (Build 0.8)
//Created By James Turner
$FullVersion = "0.8.5";
$SimpleVersion = "0.8";
//Page Load Timer
$time = microtime();
$time = explode(" ", $time);
$time = $time[1] + $time[0];
$start = $time;
//Start Date: Sunday, 10th of January 2010
session_cache_limiter("none");
session_start();
header("Novis-Version: $FullVersion");
header("Server-Time: [".date("H|i|s", time())."]");
//Establish Enviroment Variables
$System = 'system';
$Themes = 'system/themes';
$Users = 'system/users';
$Config = 'system/$configuration';
$Static = 'system/$static';
$Sound = 'system/$sound';
//User Class
class User
{
	public $Name = "Not Logged In";
	public $Password = "";
	public $HomeDir = "system/users";
	public $Theme = "default";
	public $Level = 2;
	public $IsElevated = false;
	function Login($name,$password)
	{
		if ($name==NULL){return false;}
		$tmpPath = "system/users/".Parse_File_Name($name);
		if (file_exists($tmpPath))
		{
			if (file_get_contents($tmpPath.'/$settings/login.cfg')==sha1($password))
			{
				$this->Name = $name;
				$this->Password = $password;
				$this->HomeDir = $this->HomeDir."/".$this->Name;
				$this->Theme = file_get_contents($tmpPath.'/$settings/theme.cfg');
				$this->Level = file_get_contents($tmpPath.'/$settings/$level.cfg');
				return true;
			}
			return false;
		}
		return false;
	}
	function Logout()
	{
		$_SESSION["Novis"] = new User();
		CodeExit;
	}
	function IsLoggedIn()
	{
		if ($this->Level<2){return true;}
		return false;
	}
	function Elevate($Username,$Password)
	{
		if ($this->Level!=1){return false;}
		$tmpPath = "system/users/".Parse_File_Name($Username);
		if (file_exists($tmpPath))
		{
			if (file_get_contents($tmpPath.'/$settings/login.cfg')==sha1($Password) && file_get_contents($tmpPath.'/$settings/$level.cfg')==0)
			{
				$this->IsElevated = true;
				$this->Level = 0;
				return true;
			}
			return false;
		}
		return false;
	}
}
//Check User
if ($_SESSION["Novis"]==NULL) { $_SESSION["Novis"] = new User(); }
//Exit Function
function CodeExit()
{
	if ($_SESSION["Novis"]->IsElevated){$_SESSION["Novis"]->IsElevated=false;$_SESSION["Novis"]->Level=1;}
	exit;
}
//Elevate
if ($_POST["EUser"]!=NULL && $_POST["EPassword"]!=NULL){if (!($_SESSION["Novis"]->Elevate($_POST["EUser"],$_POST["EPassword"]))){echo "false"; CodeExit();}}
//Include Extensions
require($System.'/$parser.inc.php');
require($System.'/$configuration.inc.php');
require($System.'/$filesystem.inc.php');
//Start of Processing
if ($_GET["action"]=="login") {if ($_SESSION["Novis"]->Login(Decode($_POST["user"]),Decode($_POST["password"]))){echo "true"; CodeExit();} echo "false"; CodeExit();}
if ($_GET["action"]=="logout") {$_SESSION["Novis"]->Logout();}
if ($_GET["action"]=="status") {if ($_SESSION["Novis"]->IsLoggedIn()){echo "true"; CodeExit();} echo "false"; CodeExit();}
if ($_GET["action"]!=NULL || $_GET["get"]!=NULL) {CodeExit();}
//Output Main Document
echo '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>Novis '.$SimpleVersion.'</title>
<!-- Version: '.$FullVersion.' -->
<!-- Created by James Turner -->
<!-- http://novis.turnersoftware.au.com/ -->
<script type="text/javascript" src="index.php?action=fs-get&amp;type=static&amp;path=core.js"></script>
<link rel="apple-touch-icon" href="apple-touch-icon.png" />
<link rel="shortcut icon" href="favicon.png" />
<link rel="stylesheet" id="Static-CSS" type="text/css" href="index.php?action=fs-get&amp;type=static&amp;path=static.css" />
<link rel="stylesheet" id="Current-CSS" type="text/css" href="index.php?action=fs-get&amp;type=themes&amp;path='.$_SESSION["Novis"]->Theme.'/theme.css" />
</head>
<body id="Body" onresize="Core.Environment.Resize();" oncontextmenu="return false;" onbeforeunload="if(Core.Session.ClosePrompt){return \'Closing Novis without logging out may result in lost data!\';}">
<div id="Menu" class="Menu" style="height:24px; opacity:0.6; z-index:9999; overflow:hidden; background-color:#000000;" onmouseover="Core.Menu.Effects.MouseOver();" onmouseout="Core.Menu.Effects.MouseOut();">
	<div id="WinDescription" style="position:relative; top:25px; left:5px;"></div>
	<div id="Ajax" style="position:absolute; top:5px; width:100%; text-align:right; display:none;">
		<img style="width:16px; height:16px;" src="index.php?action=fs-get&type=static&path=ajax-loader-4.gif" />
	</div>
	<div id="WinControls" style="position:absolute; top:25px; width:100%; text-align:right; display:none;">
		<img style="width:22px; height:22px;" title="Sound Manager" src="index.php?action=fs-get&type=themes&path=default/22/status/audio-volume-high.png" onclick="Core.Applications.Run(\'soundman.js\',\'apps\',\'\');" id="Sound-Man-Menu-Icon" />
		<img style="width:22px; height:22px;" title="File Browser" src="index.php?action=fs-get&type=themes&path=default/22/places/user-home.png" onclick="Core.Applications.Run(\'fsbrowser.js\',\'apps\',\'\');" />
		<img style="width:22px; height:22px;" title="Application Launcher" src="index.php?action=fs-get&type=themes&path=default/22/places/start-here.png" onclick="Core.Applications.Run(\'launcher.js\',\'apps\',\'\');" />
		<img style="width:22px; height:22px;" title="Display Settings" src="index.php?action=fs-get&type=themes&path=default/22/apps/preferences-desktop-wallpaper.png" onclick="Core.Applications.Run(\'settings.js\',\'apps\',\'\');" />
		<img style="width:22px; height:22px;" title="Logout" src="index.php?action=fs-get&type=themes&path=default/22/actions/system-log-out.png" onclick="Core.Session.Logout();" />
	</div>
</div>';

echo '<div id="NotLoggedIn" style="opacity:1;">
	<br /><br />
	<img src="index.php?action=fs-get&amp;type=static&amp;path=novis.png" />
	<br /><br />Created by
	<br />
	<img style="cursor:pointer;" src="index.php?action=fs-get&amp;type=static&amp;path=logo.png" onclick="window.open(\'http://www.turnersoftware.au.com\');" />
</div>';

echo '<div id="Desktop-Icons" style="position:absolute; left:0px; top:20px; width:0px; height:0px; overflow:hidden; display:none; opacity:0;"></div>
';

echo '<div id="Menus"></div>
';

echo '<div id="MessageBoxes" style="width:100%; z-index:9998;"></div>
';

echo '<div id="Sound-Players" style="display:none"></div>
';

echo '<div id="Novis-Time" onmouseover="Core.Effects.Fade(\'Novis-Time\',100,20);" onmouseout="Core.Effects.Fade(\'Novis-Time\',50,20);" style="position:absolute; bottom:0px; left:0px; opacity:0.5;"></div>
';

echo '<script type="text/javascript">Core.Applications.Run("login.js","static",\'\'); Core.Environment.Resize(); Core.Version="'.$FullVersion.'"; Core.ServerCall.SendRequest("http://novis.turnersoftware.au.com/update.php?ver='.$FullVersion.'","",function(Data){
if (Data!=null && Data>Core.Version){Core.MessageBox.ShowMessage("index.php?action=fs-get&type=themes&path=default/32/status/software-update-available.png","Novis update avaliable! Version "+Data);}
});</script>
';

$time = microtime();
$time = explode(" ", $time);
$time = $time[1] + $time[0];
$finish = $time;
$totaltime = round(($finish - $start),3);
echo '<!-- Loaded in '.$totaltime.' seconds -->
</body>
</html>';
?>
