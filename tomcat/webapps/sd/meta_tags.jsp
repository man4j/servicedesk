<%
    String userAgent = request.getHeader("User-Agent");
    boolean isIE11 = userAgent.matches("(.*)Trident/7.0(.*)");
    if (isIE11)
    {
%>
	<meta http-equiv="X-UA-Compatible" content="IE=10; charset=UTF-8">
<%
    }
    else
    {
%>
	<meta http-equiv="X-UA-Compatible" content="IE=Edge; charset=UTF-8">
<%
    }
%>
	<meta http-equiv="content-type" content="text/html; charset=UTF-8" />