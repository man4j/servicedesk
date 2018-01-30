<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="ru.naumen.core.server.SpringContext"%>
<%!
private String getThemeFilePath(SpringContext context, String theme)
{
    String themeFile = "themeBlue.css";
    if("site".equals(theme))
        themeFile = "themeSite.css";
    if("scheme1".equals(theme))
        themeFile = "themeScheme1.css";
    if("scheme2".equals(theme))
        themeFile = "themeScheme2.css";
    if("scheme3".equals(theme))
        themeFile = "themeScheme3.css";
    if("scheme4".equals(theme))
        themeFile = "themeScheme4.css";
    if("scheme5".equals(theme))
        themeFile = "themeScheme5.css";
    return context.getContextPath() + "/" + themeFile;
}
%>
<%
SpringContext context=SpringContext.getInstance();
ru.naumen.metainfo.server.MetainfoService service = context.getBean(ru.naumen.metainfo.server.MetainfoService.class);
String theme = "";
if(service.getInterfaceSettings() != null)
{
	theme =  service.getInterfaceSettings().getThemeOperator();
}
%>
<link rel="stylesheet" href="<%=getThemeFilePath(context,theme)%>" type="text/css"/>