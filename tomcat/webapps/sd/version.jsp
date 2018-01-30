<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%><%/*$Id$*/ %>
<%@ page import="ru.naumen.core.server.Version,
ru.naumen.core.server.SpringContext"%>
<%
SpringContext springCtx = SpringContext.getInstance();
ru.naumen.metainfo.server.MetainfoService srv = springCtx.getBean(ru.naumen.metainfo.server.MetainfoService.class);
boolean isStandardTitle = true;
if (srv.getInterfaceSettings() != null && srv.getInterfaceSettings().getTabTitleSettings() != null)
{
    isStandardTitle = srv.getInterfaceSettings().getTabTitleSettings().isTabTitleStandard();
}
if (isStandardTitle)
{
%>
<title><spring:message code="company.productname"/></title>

<%
}
else
{
    String title = srv.getInterfaceSettings().getTabTitleSettings().getTabTitle();
    if (title.isEmpty())
    {
        title = "&nbsp;";
    }
    %>
<title><%=title%></title>
    <%
}
%>
<script language="javascript">
var appVersion = {
    "buildNumber": "<%=Version.getBuildNumber()%>",
    "buildTime":   "<%=Version.getBuildTime()%>",
    "fullVersion": "<%=Version.getFullVersion()%>",
    "version":     "<%=Version.getVersion()%>"
};
</script>