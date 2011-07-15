<?PHP
session_start();

//Common Variables
define("NOVIS_VERSION","1.0");

//Common Functions
function GUID()
{
    if (function_exists('com_create_guid') === true)
    { return trim(com_create_guid(), '{}'); }
    return sprintf('%04X%04X-%04X-%04X-%04X-%04X%04X%04X', mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(16384, 20479), mt_rand(32768, 49151), mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(0, 65535));
}

//===> Config Functions
function Config_Read($path,$key,$default)
{
	if (!file_exists($path))return;
	$lines = file($path,FILE_SKIP_EMPTY_LINES);
	foreach($lines as $line)
	{
		$keypair = explode("::",$line);
		if ($keypair[0]!=$key) continue;
		return trim($keypair[1]);
	}
	return $default;
}
function Config_Write($path,$key,$value)
{
	if (!file_exists($path))return;
	$line = file($path,FILE_SKIP_EMPTY_LINES);
	$keyfound = false;
	for($i = 0; $i < count($line); $i++)
	{
		$keypair = explode("::",$line[$i]);
		if ($keypair[0]!=$key) continue;
		$keyfound = true;
		$line[$i]=$key."::".$value.PHP_EOL;
		break;
	}
	if (!$keyfound)
	{
		array_push($line,$key."::".$value);
	}
	file_put_contents($file,$line);
}
//<=== Config Functions

//===> Encoding and Transmitting Functions
function Encode_2_JSON($obj)
{
	return json_encode($obj);
}
function Decode_From_JSON($json)
{
	return json_decode($json);
}
function Send_Data($obj,$error = false,$errorMessage = "")
{
	$a = array('novis-version' => constant("NOVIS_VERSION"),'server-time-format' => "H:i:s m.d.Y",
	'server-time' => date("H:i:s m.d.Y"),'error' => $error,'error-message' => $errorMessage,'data' => $obj);
	echo Encode_2_JSON($a);
}
//<=== Encoding and Transmitting Functions

//===> Internal Error Handling
function Server_Error_Handler($errno, $errstr, $errfile, $errline)
{
	if (!(error_reporting() & $errno)) {
        // This error code is not included in error_reporting
        return;
    }
    /*switch ($errno) {
    case E_USER_ERROR:
        echo "<b>My ERROR</b> [$errno] $errstr<br />\n";
        echo "  Fatal error on line $errline in file $errfile";
        echo ", PHP " . PHP_VERSION . " (" . PHP_OS . ")<br />\n";
        echo "Aborting...<br />\n";
        exit(1);
        break;
    case E_USER_WARNING:
        echo "<b>My WARNING</b> [$errno] $errstr<br />\n";
        break;

    case E_USER_NOTICE:
        echo "<b>My NOTICE</b> [$errno] $errstr<br />\n";
        break;

    default:
        echo "Unknown error type: [$errno] $errstr<br />\n";
        break;
    }*/
    Send_Data(null,true,$errstr); //sends error to client
    exit;
    /* Don't execute PHP internal error handler */
    return true;
}
set_error_handler("Server_Error_Handler");
//<=== Internal Error Handling

//===> Misc Functions
function FS_Parse_File_Name($name)
{
	$name=str_replace("/","",$name);
	$name=str_replace("\\","",$name);
	$name=str_replace(":","",$name);
	$name=str_replace("*","",$name);
	$name=str_replace("?","",$name);
	$name=str_replace("\"","",$name);
	$name=str_replace("<","",$name);
	$name=str_replace(">","",$name);
	$name=str_replace("|","",$name);
	return $name;
}
function User_Logged_In()
{
	return (isset($_SESSION["Novis_User"])&&$_SESSION["Novis_User"]!=null);
}
function Bool_2_String($bool)
{
	return ($bool?"true":"false");
}
//<=== Misc Functions

//Final Configuration
$JSON = null;
if (isset($_POST["json"]))$JSON = Decode_From_JSON($_POST["json"]);
?>
