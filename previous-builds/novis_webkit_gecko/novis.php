<?PHP
//Novis PHP Backend
/*
 * Notes
 * 
 * - May switch from folder.conf permission system to the underlying systems file and folder permission
 * 		- My current system is for that folder only!
 * 		- Parent and sibling folders may have different permissions (higher OR lower)
 * 
 */
session_start();
//Set Header Information
header("NVersion: 1.0.0");
//Function List
function Setup()
{
	$_SESSION["Novis_Session"] = new Session();
	$_SESSION["Novis_FileSys"] = new FileSys();
	$_SESSION["Novis_Sys"] = new System();
}
function BoolString($bool)
{
	if ($bool==true){return "true";}
	elseif ($bool==false){return "false";}
	return $bool;
}
function Encode($string)
{
	return str_replace("+","%20",urlencode($string));
}
function Decode($string)
{
	return trim($string);
}
class Session
{
	public $Username = "";
	private $Level = 0;
	public $ELevel = 0;
	function Login($username,$password)
	{
		if ($_SESSION["Novis_Sys"]->UserExists($username)&&sha1($password)==$_SESSION["Novis_Sys"]->ReadConfig("system/users/".$username."/folder.conf","Password"))
		{
			if (!$this->LoggedIn())
			{
				$this->Username = $username;
				$this->Level = $_SESSION["Novis_Sys"]->ReadConfig("system/users/".$username."/folder.conf","Level");
				$this->ELevel = $this->Level;
				return true;
			}
			elseif ($this->Level<$_SESSION["Novis_Sys"]->ReadConfig("system/users/".$username."/folder.conf","Level"))
			{
				$this->ELevel = $_SESSION["Novis_Sys"]->ReadConfig("system/users/".$username."/folder.conf","Level");
				return true;
			}
			return false;
		}
		return false;
	}
	function Logout()
	{
		if ($this->LoggedIn())
		Setup();
		return true;
	}
	function Elevate($username,$password)
	{
		return $this->Login($username,$password);
	}
	function Unelevate()
	{
		if ($this->Level<$this->ELevel)return false;
		$this->ELevel = $this->Level;
		return true;
	}
	function ChangePassword($password,$newPassword)
	{
		if (!$this->LoggedIn()||sha1($password)!=$_SESSION["Novis_Sys"]->ReadConfig("system/users/".$this->Username."/folder.conf","Password"))return false;
		$_SESSION["Novis_Sys"]->WriteConfig("system/users/".$this->Username."/folder.conf","Password",sha1($newPassword));
		return true;
	}
	function LoggedIn()
	{
		return ($this->Level>0);
	}
}
class FileSys
{
	function ParseName($name)
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
	function ParentDirectory($path)
	{
		return substr($path,0,strrpos($path,"/"));
	}
	function FileName($path)
	{
		return substr($path,strrpos($path,"/")+1);
	}
	function FileExtension($path)
	{
		return substr($path,strrpos($path,".")+1);
	}
	function DirectoryName($path)
	{
		if (strrpos($path,"/")==-1){return $path;}
		return substr($path,0,strrpos($path,"/"));
	}
	function FormPath($path)
	{
		if (substr($path,strlen($path)-1)!="/") {return $path."/";}
		return $path;
	}
	function ReadPermission($path)
	{
		//Was originally going to have -1 values for read permission but if they cant read, whats the point of having the file
		$path = $this->FormPath($path);
		if (file_exists($path))
		{
			if (is_file($path))
			{
				return ($_SESSION["Novis_Session"]->ELevel>=$_SESSION["Novis_Sys"]->ReadConfig($this->ParentDirectory($path)."folder.conf","ReadLevel"));
			}
			elseif (is_dir($path))
			{
				return ($_SESSION["Novis_Session"]->ELevel>=$_SESSION["Novis_Sys"]->ReadConfig($path."folder.conf","ReadLevel"));
			}
			else
			{
				return false;
			}
		}
		return false;
	}
	function WritePermission($path)
	{
		$path = $this->FormPath($path);
		if (file_exists($path))
		{
			if (is_file($path))
			{
				$lvl = $_SESSION["Novis_Sys"]->ReadConfig($this->ParentDirectory($path)."folder.conf","WriteLevel");
				return ($_SESSION["Novis_Session"]->ELevel>=$lvl&&$lvl!=-1);
			}
			elseif (is_dir($path))
			{
				$lvl = $_SESSION["Novis_Sys"]->ReadConfig($path."folder.conf","WriteLevel");
				return ($_SESSION["Novis_Session"]->ELevel>=$lvl&&$lvl!=-1);
			}
			else
			{
				return false;
			}
		}
		return false;
	}
	function GetDir($path)
	{
		if ($this->ReadPermission($path)&&is_dir($path))
		{
			$tmpStr = "[Name|Extension|Path|FileSize|CreatedTime|ModifiedTime|AccessTime]";
			$dir=scandir($path);
			foreach ($dir as $file)
			{
				if ($file!="." && $file!=".." && $file!="folder.conf")
				{
					if (is_file($path.$file))
					{
						$tmpStr=$tmpStr.$this->GetFileInfo($path.$file);
					}
					elseif (is_dir($path.$file))
					{
						$tmpStr=$tmpStr.$this->GetDirInfo($path.$file);
					}
				}
			}
			return $tmpStr;
		}
		return false;
	}
	function GetFileInfo($path)
	{
		if ($this->ReadPermission($path)&&is_file($path))
		{
			clearstatcache();
			return "[".$this->FileName($path)."|".$this->FileExtension($path)."|".
						$this->ParentDirectory($path)."|".filesize($path)."|".
						date("D, d M Y H:i:s", filectime($path))."|".
						date("D, d M Y H:i:s", filemtime($path))."|".
						date("D, d M Y H:i:s", fileatime($path))."]";
		}
		return false;
	}
	function GetDirSize($path,$recursion = 5,$depth = 0)
	{
		if ($depth>$recursion&&$recursion!=-1)return false;
		if ($this->ReadPermission($path)&&is_dir($path))
		{
			$path = $this->FormPath($path);
			$dir = scandir($path);
			$totalSize = 0;
			foreach ($dir as $file)
			{
				if ($file!="." && $file!=".." && $file!="folder.conf")
				{
					if (is_file($path.$file))
					{
						$totalSize += filesize($path.$file);
					}
					elseif (is_dir($path.$file))
					{
						$depth++;
						$size = $this->GetDirSize($path.$file,$recursion,$depth);
						if ($size!=false)
						$totalSize += $size;
					}
				}
			}
			return $totalSize;
		}
		return false;
	}
	function GetDirInfo($path)
	{
		if ($this->ReadPermission($path)&&is_dir($path))
		{
			return "[".$this->FileName($path)."||".
						$this->ParentDirectory($path)."|".$this->GetDirSize($path)."|".
						date("D, d M Y H:i:s", filectime($path))."|".
						date("D, d M Y H:i:s", filemtime($path))."|".
						date("D, d M Y H:i:s", fileatime($path))."]";
		}
		return false;
	}
	function CreateFile($path,$name)
	{
		$path = $this->FormPath($path);
		$name = $this->ParseName($name);
		if ($this->WritePermission($path)&&is_dir($path)&&!file_exists($path.$name)&&$name!="folder.conf")
		{
			file_put_contents($path.$name,"");
			return $path.$name;
		}
		return false;
	}
	function GetFile($path)
	{
		if ($this->ReadPermission($path)&&is_file($path))
		{
			return file_get_contents($path);
		}
		return false;
	}
	function ModifyFile($path,$contents)
	{
		$path = $this->FormPath($path);
		if ($this->WritePermission($path)&&is_writable($path)&&$this->FileName($path)!="folder.conf")
		{
			file_put_contents($path,$contents);
			return true;
		}
		return false;
	}
	function DeleteFile($path)
	{
		$path = $this->FormPath($path);
		if ($this->WritePermission($path)&&is_writable($path)&&$this->FileName($path)!="folder.conf")
		{
			unlink($path);
			return true;
		}
		return false;
	}
	function RenameFile($path,$name)
	{
		$name = $this->ParseName($name);
		if ($this->WritePermission($path)&&is_writable($path)&&$this->FileName($path)!="folder.conf"&&$name!="folder.conf")
		{
			return rename($path,$this->ParentDirectory($path).$name);
			//Below is another way of doing it
			/*$bool = $this->CreateFile($this->ParentDirectory($path),$name);
			if ($bool)
			{
				$bool = $this->GetFile($path);
				if ($bool)
				{
					$bool = $this->ModifyFile($this->ParentDirectory($path).$name,$bool);
					if ($bool)
					{
						$bool = $this->DeleteFile($path);
						if ($bool)
						{
							return true;
						}
					}
				}
				//Cleans up on fail
				$this->DeleteFile($this->ParentDirectory($path).$name);
			}*/
		}
		return false;
	}
	function CopyFile($file,$path)
	{
		if ($this->FileName($file)!="folder.conf"&&$this->FileName($path)!="folder.conf")
		{
			$data = $this->GetFile($file);
			if ($data!=false)
			{
				$result = $this->CreateFile($this->ParentDirectory($path),$this->FileName($path));
				if ($result)
				{
					$result = $this->ModifyFile($path,$data);
					if ($result)
					{
						return true;
					}
					$this->DeleteFile($this->ParentDirectory($path),$this->FileName($path));
					return false;
				}
			}
		}
		return false;
	}
	function MoveFile($file,$path)
	{
		$name = $this->ParseName($name);
		if ($this->WritePermission($file)&&is_writable($file)&&$this->WritePermission($path)&&$this->FileName($path)!="folder.conf"&&$this->FileName($file)!="folder.conf")
		{
			return rename($file,$path);
		}
		return false;
	}
	function CreateDirectory($path,$name)
	{
		$path = $this->FormPath($path);
		$name = $this->ParseName($name);
		if ($this->WritePermission($path)&&is_writable($path))
		{
			mkdir($path.$name);
			//Creates folder permissions and sets it to user permissions
			file_put_contents($path.$name."/folder.conf","");
			$_SESSION["Novis_Sys"]->WriteConfig($path.$name."/folder.conf","ReadLevel",$_SESSION["Novis_Session"]->ELevel);
			$_SESSION["Novis_Sys"]->WriteConfig($path.$name."/folder.conf","WriteLevel",$_SESSION["Novis_Session"]->ELevel);
			$_SESSION["Novis_Sys"]->WriteConfig($path.$name."/folder.conf","Author",$_SESSION["Novis_Session"]->Username);
			return $path.$name;
		}
		return false; 
	}
	function CopyDirectory($dir,$path)
	{
		
	}
}
class System
{
	function UserExists($username)
	{
		return (file_exists("system/users/".$username)&&$_SESSION["Novis_Sys"]->ReadConfig("system/users/".$username."/folder.conf","User")==$username);
	}
	function ReadConfig($file,$key)
	{
		$lines = file($file,FILE_SKIP_EMPTY_LINES);
		foreach($lines as $line)
		{
			$keypair = explode("::",$line);
			if ($keypair[0]!=$key) continue;
			return trim($keypair[1]);
		}
		return false;
	}
	function WriteConfig($file,$key,$value)
	{
		$line = file($file,FILE_SKIP_EMPTY_LINES);
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
}
//Start Processing
if (!isset($_SESSION["Novis"])||$_SESSION["Novis"]==false){Setup();$_SESSION["Novis"] = true;}

$_SESSION["Novis_Session"]->Login("test","test"); // <--- Debugging only! Resets Novis session on every reload
echo $_SESSION["Novis_FileSys"]->ReadPermission("system/users/test")."<br />";
echo $_SESSION["Novis_FileSys"]->GetDirInfo("system/users/test");

$_SESSION["Novis"] = false; // <--- Debugging only! Resets Novis session on every reload
?>
