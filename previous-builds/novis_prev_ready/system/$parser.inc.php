<?PHP
function Encode($string)
{
	return str_replace("+","%20",urlencode($string));
}
function Decode($string)
{
	return trim($string);
}
function Parse_File_Name($string)
{
	$string=str_replace("/","",$string);
	$string=str_replace("\\","",$string);
	$string=str_replace(":","",$string);
	$string=str_replace("*","",$string);
	$string=str_replace("?","",$string);
	$string=str_replace("\"","",$string);
	$string=str_replace("<","",$string);
	$string=str_replace(">","",$string);
	$string=str_replace("|","",$string);
	return $string;
}
function Add_Final_Slash($string)
{
	if (substr($string,strlen($string)-1)!="/") {return $string."/";}
	return $string;
}
function Remove_Final_Slash($string)
{
	if (substr($string,strlen($string)-1)=="/") {return substr($string,0,strlen($string)-1);}
	return $string;
}
function Shorten_Path($string)
{
	return str_replace("../","",$string);
}
function File_Name($string)
{
	if (strrpos($string,"/")==-1){return $string;}
	return substr($string,strrpos($string,"/")+1);
}
function Parent_Directory($path)
{
	return substr($path,0,strrpos(Remove_Final_Slash($path),"/"));
}
?>