<%@page import="ru.naumen.core.server.filestorage.DownloadServlet"%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%><%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<!DOCTYPE html><%/*Интерфейс оператора (инженера)*/ %>
<html>
<head>
<meta name="gwt:property" content="module=operator"/>
	<%@ include file="../meta_tags.jsp" %>
	<%@ include file="../favicon.jsp"%>
	<%@ include file="personalsettings.jsp" %>
	<%@ include file="edssettings.jsp" %>
	<%@ include file="../version.jsp" %>
	<%@ include file="../i18n.jsp" %>
	<%@ include file="../commons/common.jsp" %>
	<script src="operator.nocache.js?<%= ru.naumen.core.shared.utils.UUIDGenerator.get().nextUUID() %>"></script>
	<%
	  String url = (String)request.getSession().getAttribute(ru.naumen.core.shared.Constants.DOWNLOAD);
	  request.getSession().removeAttribute(ru.naumen.core.shared.Constants.DOWNLOAD);
	%>
	<script>
		if("<%=url%>" != "undefined") var downloadHref = "<%=url%>";
	</script>
	<style>
		.b-lightbox-form ~ div { z-index: 90004 !important; }
		<!-- Необходимо фиксированной шапке. Все PopupPanel по умолчанию имеют z-index меньше, чем фикс. шапка.
		     При открытии модального окна, ситуация противоположная.
		     Костыль. Необходим, пока PopupPanel не заменен на PopupPanel2 -->
	</style>
</head>
<body id="operatorModule">
	<%
	if(SpringContext.getInstance().isCluster())
    {
    %>
   		<div id="nodeId" style="display: none;"><%=SpringContext.getInstance().getClusterNode()%></div>
    <%
    }
	%>
	<iframe src="javascript:''" id="__gwt_historyFrame" tabIndex='-1' style="position: absolute; width: 0; height: 0; border: 0;"></iframe>
	<div id="AtestInterfaceOperator" style="display: none;" ></div>

	<div style="width: 150px; margin: 0 auto; text-align: center; padding: 50px; font-size: 12px; font-family: Arial,sans-serif;" id="loadContainer">
		<img src=<%= ajaxLoaderAnimPath %> alt='<spring:message code="application.loading.indicator"/>' />
		<p><spring:message code="application.loading"/></p>
	</div>

	<script src="<%= application.getContextPath() %>/operator/metainfo"></script>
	<script src="<%= application.getContextPath() %>/operator/settings"></script>

	<noscript>
		<div style="width: 22em; position: absolute; left: 50%; margin-left: -11em; color: red; background-color: white; border: 1px solid red; padding: 4px; font-family: sans-serif">
			<spring:message code="must.have.javascipt"/>
		</div>
	</noscript>
	<% if(edsConf != null && edsConf.isEdsEnabled()) { %>
	<style>
		object.hiddenObject {
			visibility: hidden;
			width: 0;
			height: 0;
			margin: 0;
			padding: 0;
			border: 0;
			max-width: 0;
			max-height: 0;
			display: block;
		}
	</style>
	<object id="cadesplugin_object" type="application/x-cades" class="hiddenObject"></object>
	<% } %>
</body>
</html>
