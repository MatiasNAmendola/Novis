<?PHP
if ($_GET["get"]=="ctheme")
{
	header("Content-Length: ".strlen($_SESSION["Novis"]->Theme));
	echo $_SESSION["Novis"]->Theme;
	CodeExit();
}
if ($_GET["get"]=="username")
{
	header("Content-Length: ".strlen($_SESSION["Novis"]->Name));
	echo $_SESSION["Novis"]->Name;
	CodeExit();
}
?>