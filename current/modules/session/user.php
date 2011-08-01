<?PHP
//User Class
class User
{
	public $Name = null;
	//Types: 1 = Standard, 0 = Root
	public $Type = 1;
	public function __construct($Name,$Type)
	{
		$this->$Name = $Name;
		$this->$Type = $Type;
	}
	public function HomeDirectory()
	{
		return "users/$Name/";
	}
	public function ConfigPath()
	{
		return "users/$Name.conf";
	}
	public function IsAdmin()
	{
		return ($Type==0);
	}
}

?>