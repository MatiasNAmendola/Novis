<?PHP
function IsLoggedIn()
{
	return (isset($_SESSION["Novis_User"])&&$_SESSION["Novis_User"]!=null);
}
function IsAdmin()
{
	return (IsLoggedIn()?$_SESSION["Novis_User"]->IsAdmin():false);
}
function ReadConfig($ConfigFile)
{
	$config = Array();
	$lines = file($ConfigFile,FILE_SKIP_EMPTY_LINES);
	foreach($lines as $line)
	{
		$keypair = explode(":",$line);
		$config[$keypair[0]] = trim($keypair[1]);
	}
	return $config;
}
function WriteConfig($ConfigFile,$Key,$Value)
{
	$line = file($ConfigFile,FILE_SKIP_EMPTY_LINES);
	$keyfound = false;
	for($i = 0; $i < count($line); $i++)
	{
		$keypair = explode("::",$line[$i]);
		if ($keypair[0]!=$Key) continue;
		$keyfound = true;
		$line[$i]=$Key.":".$Value.PHP_EOL;
		break;
	}
	if (!$keyfound)
	{
		array_push($line,$Key.":".$Value);
	}
	file_put_contents($ConfigFile,$line);
}
function WriteAllToConfig($ConfigFile,$Keys,$Values)
{
	for ($i = 0; $i < count($Keys); $i++)
	{
		if ($i>=count($Values)) return;
		WriteConfig($ConfigFile,$Keys[$i],$Values[$i]);
	}
}
?>