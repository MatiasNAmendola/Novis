//Novis Time Manager
setInterval("updateTime()",1000);
hours = 0;
minutes = 0;
seconds = 0;
function updateTime()
{
	seconds++;
	if (seconds==60){seconds=0;	minutes++;}
	if (minutes==60){minutes=0;	hours++;}
	if (hours==24){hours=0;}
}
function messageReceiver(event)
{
	var tmpHours = hours;
	var tmpMinutes = minutes;
	var tmpSeconds = seconds;
	if (hours<10){tmpHours="0"+hours;}
	if (minutes<10){tmpMinutes="0"+minutes;}
	if (seconds<10){tmpSeconds="0"+seconds;}
	if (event.data=="raw"){postMessage("["+tmpHours+"|"+tmpMinutes+"|"+tmpSeconds+"]");return;}
	if (event.data=="now"){postMessage(tmpHours+":"+tmpMinutes+":"+tmpSeconds);return;}
	var time = event.data;
	time = time.substr(1,time.length-2);
	time = time.split("|");
	hours = parseInt(time[0]);
	minutes = parseInt(time[1]);
	seconds = parseInt(time[2]);
}
function errorReceiver(event)
{  
	throw event.data;  
}

onerror = errorReceiver;
onmessage = messageReceiver;