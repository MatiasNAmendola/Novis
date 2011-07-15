<?PHP
require("general.php");
//File System Functions
function FS_Valid_Path($path,$noExist=false)
{
	$pieces = explode("/",$path);
	foreach ($pieces as $piece)
	{
		if ($piece=="."||$piece==".."||FS_Parse_File_Name($piece)!=$piece)
		return false;
	}
	return ($noExist==true?true:file_exists($pieces));
}
function FS_Format_Path($path)
{
	return (substr($path,strlen($path)-1)!="/"?"$path/":$path);
}
function FS_Contains_Path($path,$compare)
{
	return strpos($path,$compare)!=-1;
}
function FS_Is_Admin()
{
	return (Config_Read($_SESSION["Novis_Settings"]."login.cfg","Admin",null)=="true");
}
function FS_Is_Settings_Directory($path)
{
	//i technically dont need this line as the other code does this too
	if (FS_Contains_Path($path,$_SESSION["Novis_Settings"])) return true;
	$path_ex = explode("/",$path);
	if (count($path_ex)>=3&&$path_ex[0]=="users"&&$path_ex[2]=="settings") return true;
	return false;
}
function FS_Allow_Access($path)
{
	//Checks if the directory is not the user and they are admin
	//Checks if it access the users local settings directory
	return ((!FS_Contains_Path($path,$_SESSION["Novis_Root"])&&FS_Is_Admin())||
		!FS_Is_Settings_Directory($path));
}
function FS_Read_File($path)
{
	if (!FS_Valid_Path($path)) return false;
	if (!FS_Allow_Access($path)) return false;
	return (is_file($path)?file_get_contents($path):false);
}
function FS_Write_File($path,$data,$append=false)
{
	if (!FS_Valid_Path($path)) return false;
	if (!FS_Allow_Access($path)) return false;
	if (!is_file($path)) return false;
	if ($append)
		file_put_contents($path,file_get_contents($path).$data);
	else
		file_put_contents($path,$data);
}
?>
