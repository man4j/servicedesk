<%@page import="ru.naumen.core.server.bo.root.Root"%>
<%@page import="ru.naumen.core.server.bo.root.RootDao"%>
<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ page
	import="ru.naumen.core.server.license.LicensingService,
    ru.naumen.core.server.license.conf.AbstractLicenseGroup,
    org.apache.commons.lang.StringEscapeUtils,
    org.springframework.web.context.ContextLoader,
    org.springframework.web.context.WebApplicationContext,  
    ru.naumen.core.server.settings.SharedSettingsService,
    java.util.Collection,
    ru.naumen.core.server.util.log.ReadyStateLoggingSettings,
    java.util.regex.Matcher,
	java.util.regex.Pattern"%>
<%
    WebApplicationContext ctx = ContextLoader.getCurrentWebApplicationContext();
    Root root = ctx.getBean("rootDaoImpl", RootDao.class).getCoreRoot();  
    LicensingService licensingService = ctx.getBean(LicensingService.class);
	String sharedSettings = ctx.getBean("SharedSettingsService", SharedSettingsService.class).getSettingsJson();
    ReadyStateLoggingSettings readyStateLogSettings = ctx.getBean(ReadyStateLoggingSettings.class);
%>
<script>
var sessionId = "<%=session.getId()%>";

var licenses = [
<%for (AbstractLicenseGroup grp : licensingService.getLicenseGroups())
            {%>  { "i" : "<%=StringEscapeUtils.escapeJavaScript(grp.getId())%>", "t" : "<%=StringEscapeUtils.escapeJavaScript(grp.getTitle())%>" },
<%}%>		
];
var coreRoot = {
	    "uuid": "<%=StringEscapeUtils.escapeJavaScript(root.getUUID())%>",
	    "title": "<%=StringEscapeUtils.escapeJavaScript(root.getTitle())%>"
	};
var sharedSettings = <%=sharedSettings%>;
var readyStateLogSettings = {
	"logEnable" : <%=readyStateLogSettings.isLogEnable()%>,
	"gwtLogDepth" : <%=readyStateLogSettings.getGwtLogDepth()%>,
};

<%
	String defaultButtonColor = "#3397db";
	String defaultHoverButtonColor = "#0fabff";
	String defaultActiveButtonColor = "#2385c7";
	String defaultMainBackgroundColor = "#ebeff1";
	String defaultClientColor = "#666666";
	String defaultOperatorColor = "#3397da";
	
	String buttonColor = request.getParameter("buttonColor"); 
	String hoverButtonColor = request.getParameter("hoverButtonColor");
	String activeButtonColor = request.getParameter("activeButtonColor");
	String mainBackgroundColor = request.getParameter("mainBackgroundColor");
	String clientColor = request.getParameter("clientColor");
	String operatorColor = request.getParameter("operatorColor");
	
	//Паттерн, проверяющий hex color
	String HEX_PATTERN = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$";
	Pattern pattern = Pattern.compile(HEX_PATTERN);
	
	
	if(buttonColor == null || !pattern.matcher(buttonColor).matches()) 
	{
	    buttonColor = defaultButtonColor;
	}
	if(hoverButtonColor == null || !pattern.matcher(hoverButtonColor).matches()) 
	{
	    hoverButtonColor = defaultHoverButtonColor;
	}
	if(activeButtonColor == null || !pattern.matcher(activeButtonColor).matches()) 
	{
	    activeButtonColor = defaultActiveButtonColor;
	}
	if(mainBackgroundColor == null || !pattern.matcher(mainBackgroundColor).matches()) 
	{
	    mainBackgroundColor = defaultMainBackgroundColor;
	}
	if(clientColor == null || !pattern.matcher(clientColor).matches()) 
	{
	    clientColor = defaultClientColor;
	}
	if(operatorColor == null || !pattern.matcher(operatorColor).matches()) 
	{
	    operatorColor = defaultOperatorColor;
	}
%>
var chatAppearance = {
	"buttonColor" 			: "<%=buttonColor%>",
	"hoverButtonColor" 		: "<%=hoverButtonColor%>",
	"activeButtonColor" 	: "<%=activeButtonColor%>",
	"mainBackgroundColor" 	: "<%=mainBackgroundColor%>",
	"clientColor" 			: "<%=clientColor%>",
	"operatorColor" 		: "<%=operatorColor%>"
};

</script>
