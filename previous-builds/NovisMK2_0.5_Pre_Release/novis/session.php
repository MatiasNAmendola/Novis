<?PHP
session_start();

if ($_GET["action"]=="login")
{
	$username=trim($_POST["username"]);
	$password=trim($_POST["password"]);
	if (file_exists("../users/".$username."/settings/login.cfg"))
	{
		if (file_get_contents("../users/".$username."/settings/login.cfg")==sha1($password))
		{
		$_SESSION["user"]=$username;
		$_SESSION["password"]=$password;
		echo "202|".$_POST["username"];
		exit;
		}
	}
	echo "401|";
	exit;
}

if ($_GET["action"]=="new")
{
	$username=trim($_POST["username"]);
	$password=trim($_POST["password"]);
	if (file_exists("../users/".$username."/"))
	{
	echo "409|";
	exit;
	}
	//Build File System
	mkdir("../users/".$username."/");
	mkdir("../users/".$username."/settings/");
	file_put_contents("../users/".$username."/settings/.htaccess","DENY FROM ALL");
	mkdir("../users/".$username."/desktop/");
	file_put_contents("../users/".$username."/desktop/.htaccess","DENY FROM ALL");
	mkdir("../users/".$username."/desktop/documents");
	file_put_contents("../users/".$username."/desktop/documents/.htaccess","DENY FROM ALL");
	mkdir("../users/".$username."/desktop/apps");
	file_put_contents("../users/".$username."/desktop/apps/.htaccess","DENY FROM ALL");
	//Create Settings
	//Password
	file_put_contents("../users/".$username."/settings/login.cfg",sha1($password));
	file_put_contents("../users/".$username."/settings/startup.cfg","");
	file_put_contents("../users/".$username."/settings/panelapps.cfg","filebrowser.app");
	//Complete
	echo "201|";
	exit;
}

if ($_GET["action"]=="logout")
{
	session_destroy();
	echo "204|";
}
?>