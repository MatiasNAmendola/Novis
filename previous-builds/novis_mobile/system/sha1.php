<?PHP
if (isset($_GET["str"]))
{
	echo "Hash is: ".sha1($_GET["str"]);
}
else
{
	echo "Please append '?str=STRING2HASH' to use!";
}
?>
