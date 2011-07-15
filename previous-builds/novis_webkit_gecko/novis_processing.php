<?PHP
session_start();
$version = "1.0"
$return = "";
$newline = "/r/n";

function send()
{
	$header = "NSTP/".$version.$newline;
	$sm = "";
	getServerMessages();
	for (var $i = 0; $i < count($_SESSION["novis_sm"]); $i++)
	{
		$sm += returnServerMessage($i).$newline;
	}
}
function getServerMessages()
{
	$_SESSION["novis_sm"] = array("not yet implemented");
}
function returnServerMessage($i)
{
	return "SM ".$_SESSION["novis_sm"][$i];
}

if (isset($_REQUEST["request"]))
{
	$r = $_REQUEST["request"];
	//check version
}

?>
