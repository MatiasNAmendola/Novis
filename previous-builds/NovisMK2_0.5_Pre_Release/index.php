<?PHP
session_start();
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>Novis 0.5</title>
<script type="text/javascript" src="novis/core.js"></script>
<script type="text/javascript" src="novis/windows.js"></script>
<script type="text/javascript" src="novis/api.js"></script>
<?PHP if ($_SESSION["user"]!=NULL) {echo '<script id="auto-login" type="text/javascript">Core.Session.DoLogin("'.$_SESSION["user"].'","'.$_SESSION["password"].'"); document.getElementById("auto-login").innerHTML="";</script>';} ?>
<link rel="stylesheet" id="Novis-CSS" type="text/css" href="novis/system/themes/default.css" />
</head>
<body style="overflow:hidden;" width="100%" height="100%" onload="Core.OnLoad();" onresize="Core.Environment.Resize();" oncontextmenu="return false;" onbeforeunload="if (Core.Session.ClosePrompt==true) { return 'Closing Novis without logging out may result in lost data!'; }">
<div id="Main-Handle" onclick="Core.Desktop.ContextMenu();">
<div id="Panel" class="Panel" style="position:absolute; left:0px; top:0px; width:436px; height:100%; visibility:hidden;">
<div id="Panel-Contents" style="width:100%; height:100%; left:5px; top:5px; overflow:hidden;"><div align="center"><h1>Novis</h1>
<form onsubmit="Core.Session.DoLogin(document.getElementById('Login-Username').value,document.getElementById('Login-Password').value); return false;">
Username: <input type="text" id="Login-Username" /><br />
Password: <input type="password" id="Login-Password" /><br />
<input type="submit" value="Login" title="Login to Novis!" /></form><br /><br /><br />
<h4>For New Users</h4>
<form onsubmit="Core.Session.DoNewUser(document.getElementById('NewUser-Username').value,document.getElementById('NewUser-Password').value); return false;">
Username: <input type="text" id="NewUser-Username" /><br />
Password: <input type="password" id="NewUser-Password" /><br />
<input type="submit" value="Create User" title="Not currently a User on this System? Click here to become one!" /></form></div></div>
</div>
<img id="Panel-Button" style="position:absolute; left:0px; top:0px; height:100%; width:64px;" src="Novis/Images/Misc/cp_btn.png" onclick="if(event.ctrlKey){Core.Panel.Move(2);}else{Core.Panel.Move();}" title="Click here to Show/Hide Panel" /><div id="Panel-Apps" style="position:absolute; left:0px; top:5px; width:64px; text-align:center;"></div><div id="Desktop" class="Desktop" style="position:absolute; left:64px; top:0; bottom:0; right:0; overflow:hidden;" oncontextmenu="Core.Desktop.ContextMenu('Desktop');"></div><div id="Loading-Progress" class="AJAX-Loader" style="position:absolute; right:2px; bottom:0px; display:none;">Loading...</div>
</body>
</html>