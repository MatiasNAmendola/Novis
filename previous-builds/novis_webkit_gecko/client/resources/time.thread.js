//Novis Time Keeper Thread
hours = 0;
minutes = 0;
seconds = 0;
setInterval(Update,1000);
function Update()
{
	seconds++;
	if (seconds==60){seconds=0;	minutes++;}
	if (minutes==60){minutes=0;	hours++;}
	if (hours==24){hours=0;}
	Handler("update");
}
function Handler(Message)
{
	if (Message=="update")
	{
		SendMessage("["+hours+"|"+minutes+"|"+seconds+"]");
	}
	else
	{
		var time = Message;
		time = time.substr(1,time.length-2);
		time = time.split("|");
		hours = parseInt(time[0]);
		minutes = parseInt(time[1]);
		seconds = parseInt(time[2]);
	}
}
MessageHandler = Handler;
