<?PHP
require("general.php");
//General User and Login Functions
function User_Login($username,$password)
{
	if (User_Logged_In()||FS_Parse_File_Name($username)!=$username) return false;
	if (!file_exists("users/$username/")||Config_Read("users/$username/settings/login.cfg","Password",null)!=sha1($password)) return false;
	$_SESSION["Novis_User"] = $username;
	$_SESSION["Novis_Root"] = "users/$username/";
	$_SESSION["Novis_Settings"] = "users/$username/settings/";
	return true;
}
function User_Logout()
{
	if (!User_Logged_In())return false;
	//Clears all Novis session variables
	foreach ($_SESSION as $key => $value)
	{
		if (strpos($key,"Novis_")==0)
		{
			unset($_SESSION[$key]);
		}
	}
	return true;
}
function User_Create($username,$password)
{
	//todo
}
function User_Delete($username)
{
	//todo
}
//todo: may include user elevation at a later state but i don't think i will be needing it

$output = null;
if (strrpos($_SERVER["REQUEST_URI"],"system/login.php")!=false)
{
	if (isset($_GET["action"]))
	{
		switch($_GET["action"])
		{
			case "test":
				
			break;
			case "login":
				//todo: rather than just saying false or true, also give a message why
				$output = array('login-status' => Bool_2_String(User_Login($JSON->username,$JSON->password)),
				'logged-in' => Bool_2_String(User_Logged_In()));
				Send_Data($output);
			break;
			case "status":
				$output = array('logged-in' => Bool_2_String(User_Logged_In()));
				Send_Data($output);
			break;
			case "logout":
				$output = array('logout-status' => Bool_2_String(User_Logout()));
				Send_Data($output);
			break;
		}
	}
}
?>
