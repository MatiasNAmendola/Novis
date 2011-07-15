/*
 * Novis Thread
 * 
 * 
 * Code to test threading:
 * 
 * System.Threading.New("MessageHandler = function(message){SendMessage(message);}",function(message){alert("MESSAGE: "+message);},function(message){alert("ERROR: "+message);},null);
 * System.Threading.Message(0,"Hello World!");
 * 
 */
var MessageHandler;
function ReceiveMessage(Message)
{
	try
	{
		Message=Message.data;
		if (Message.indexOf(">>EVAL|")==0)
		{
			eval(unescape(Message.substr(7)));
		}
		else if (Message.indexOf(">>ID")==0)
		{
			SendMessage(location.search.substr(1));
		}
		else if (typeof MessageHandler == 'function')
		{
			MessageHandler(Message);
		}
		else
		{
			SendMessage("Message received with no handler!",true);
		}
	}
	catch (e)
	{
		Error(e);
	}
}
function SendMessage(Message,Error)
{
	if (Error)
	return postMessage(">>"+location.search.substr(1)+"|"+escape(Message));
	postMessage(location.search.substr(1)+"|"+escape(Message));
}
function Error(Event)
{
	SendMessage(Event.message,true);
}
onmessage = ReceiveMessage;
onerror = Error;
