<%@page import="ru.naumen.core.server.util.MessageFacade"%>
<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ page
	import="ru.naumen.core.server.LocaleUtils,
    ru.naumen.core.server.license.LicensingService,
    ru.naumen.core.server.license.conf.AbstractLicenseGroup,
    org.apache.commons.lang.StringEscapeUtils,
    org.springframework.web.context.ContextLoader,
    org.springframework.web.context.WebApplicationContext,  
    ru.naumen.sec.server.CommonAuth,
    ru.naumen.sec.server.CommonAuth.CurrentUserInfo,
    ru.naumen.commons.server.utils.StringUtilities,
    ru.naumen.core.server.settings.SharedSettingsService,
    java.util.Collection,
    ru.naumen.metainfo.server.MetainfoService,
    ru.naumen.core.server.navigationsettings.NavigationSettingsValue,
    ru.naumen.core.server.util.log.ReadyStateLoggingSettings"%>
<%
    WebApplicationContext ctx = ContextLoader.getCurrentWebApplicationContext();
    CurrentUserInfo info = ctx.getBean("commonAuth", CommonAuth.class).getCurrentUserInfo();  
    LicensingService licensingService = ctx.getBean(LicensingService.class);
	String sharedSettings = ctx.getBean("SharedSettingsService", SharedSettingsService.class).getSettingsJson();
	MetainfoService metainfoService = ctx.getBean("metainfoService", MetainfoService.class);
    NavigationSettingsValue navigationSettings = metainfoService.getNavigationSettings();
    ReadyStateLoggingSettings readyStateLogSettings = ctx.getBean(ReadyStateLoggingSettings.class);
    MessageFacade messages = ctx.getBean(MessageFacade.class);
%>
<script>
var sessionId = "<%=session.getId()%>";
var currentUser = {
    "uuid": "<%=StringEscapeUtils.escapeJavaScript(info.uuid)%>",
    "title": "<%=StringEscapeUtils.escapeJavaScript(info.title)%>",
    "login": "<%=StringEscapeUtils.escapeJavaScript(info.login)%>",
    "authorizationWarning" :  "<%=StringEscapeUtils.escapeJavaScript(info.authorizationWarning)%>", 
    "metaClass": "<%=StringEscapeUtils.escapeJavaScript(info.metaClass)%>",
    "roles": <%=info.roles%>,
    "admin": <%=info.admin%>,
    "licensed": <%=info.licensed%>,
    "allowedClasses" :  <%=info.allowedClasses%>,
    "concurrentLicensed": <%=info.concurrentLicensed%>,
    "homePage": "<%=StringUtilities.toJavaScriptString(info.homePage)%>",
    "homePageInterface": "<%=StringUtilities.toJavaScriptString(info.homePageInterface)%>",
    "adminLogo": "<%=info.adminLogo%>",
    "operatorLogo": "<%=info.operatorLogo%>",
    "isExtendedWorkflow" : <%=licensingService.isExtendedWorkflow()%>
};

var copyright = "<%=StringEscapeUtils.escapeJavaScript(messages.getMessage("company.copyright"))%>";
var productName = "<%=StringEscapeUtils.escapeJavaScript(metainfoService.getProductName())%>";

var coreRoot = {
    "uuid": "<%=StringEscapeUtils.escapeJavaScript(info.rootUuid)%>",
    "title": "<%=StringEscapeUtils.escapeJavaScript(info.rootTitle)%>"
};

var licenses = [
<%for (AbstractLicenseGroup grp : licensingService.getLicenseGroups())
            {%>  { "i" : "<%=StringEscapeUtils.escapeJavaScript(grp.getId())%>", "t" : "<%=StringEscapeUtils.escapeJavaScript(grp.getTitle())%>" },
<%}%>		
];
var gwt_client_tzid = "<%=StringEscapeUtils.escapeJavaScript(info.timezoneId)%>";
var gwt_timezone_infos = <%=info.timezoneInfos%>;
var sharedSettings = <%=sharedSettings%>;
var navigationSettings = {
	"showLeftMenu" : <%=navigationSettings.isShowLeftMenu()%>,
	"showTopMenu" : <%=navigationSettings.isShowTopMenu()%>,
};
var readyStateLogSettings = {
	"logEnable" : <%=readyStateLogSettings.isLogEnable()%>,
	"gwtLogDepth" : <%=readyStateLogSettings.getGwtLogDepth()%>,
};
<%String startPlace = (String)session.getAttribute(ru.naumen.core.shared.Constants.ANCHOR);
  String dialogParameter = (String)session.getAttribute(ru.naumen.core.shared.Constants.DIALOG);
            session.removeAttribute(ru.naumen.core.shared.Constants.ANCHOR);
            session.removeAttribute(ru.naumen.core.shared.Constants.DIALOG);
            session.removeAttribute(ru.naumen.sec.server.LoginServlet.FACE_KEY);%>
            <%if (com.google.common.base.Strings.isNullOrEmpty(startPlace))
            {                
                startPlace = request.getParameter(ru.naumen.core.shared.Constants.ANCHOR);
            }
            if (com.google.common.base.Strings.isNullOrEmpty(dialogParameter))
            {                
                dialogParameter = request.getParameter(ru.naumen.core.shared.Constants.DIALOG);
                dialogParameter = dialogParameter != null ? dialogParameter : "";
            }
            if (!com.google.common.base.Strings.isNullOrEmpty(startPlace))
            {%>
                var dialogType = '<%=StringEscapeUtils.escapeJavaScript(dialogParameter.toString())%>';
                var dialog = dialogType ? "?dialog=" + dialogType : "";
                var anchorPos = window.location.href.indexOf('?anchor');
	            if(anchorPos > -1)
	            {
	                window.location.href = window.location.href.substring(0,anchorPos).concat(dialog).concat('#<%=StringEscapeUtils.escapeJavaScript(startPlace.toString())%>');
	            }
	            else if(window.location.href.indexOf('&anchor') > -1)
	            {
	                anchorPos = window.location.href.indexOf('&anchor');
	                window.location.href = window.location.href.substring(0,anchorPos).concat('#<%=StringEscapeUtils.escapeJavaScript(startPlace.toString())%>');    
	            }
	            else
	            {
	                window.location.href = dialog.concat('#<%=StringEscapeUtils.escapeJavaScript(startPlace.toString())%>');
	            }
            <%}%>
</script>
