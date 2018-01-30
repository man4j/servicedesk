<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%><%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<!DOCTYPE html><%/*Интерфейс технолога (администратора)*/ %>
<html>
<head>
	<%@ include file="../meta_tags.jsp" %>
	<%@ include file="../favicon.jsp"%>
	<%@ include file="personalsettings.jsp" %>
	<%@ include file="../version.jsp" %>
	<%@ include file="../i18n.jsp" %>
	<%@ include file="../commons/common.jsp" %>
	<script src="admin.nocache.js?<%= ru.naumen.core.shared.utils.UUIDGenerator.get().nextUUID() %>"></script>
	<style>
		<%-- TODO (fdernovoj): В рамках борьбы с распоясавшимися z-index изничтожить этот адов хак --%>
		.b-lightbox-form ~ div { z-index: 90005 !important; }
		.b-lightbox-form ~ div.formerrortext { z-index: 90004 !important; }
	</style>
</head>
<body id="adminModule">
	<%
	if(SpringContext.getInstance().isCluster())
    {
    %>
   		<div id="nodeId" style="display: none;"><%=SpringContext.getInstance().getClusterNode() %>></div>
    <%
    }
	%>
	<iframe src="javascript:''" id="__gwt_historyFrame" tabIndex='-1' style="position: absolute; width: 0; height: 0; border: 0;"></iframe>
	<div id="AtestInterfaceAdministrator" style="display: none;" ></div>

	<div style="width: 150px; margin: 0 auto; text-align: center; padding: 50px; font-size: 12px; font-family: Arial,sans-serif;" id="loadContainer">
		<img src=<%= ajaxLoaderAnimPath %> alt='<spring:message code="application.loading.indicator"/>' />
		<p><spring:message code="application.loading"/></p>
	</div>

	<noscript>
		<div style="width: 22em; position: absolute; left: 50%; margin-left: -11em; color: red; background-color: white; border: 1px solid red; padding: 4px; font-family: sans-serif">
			<spring:message code="must.have.javascipt"/>
		</div>
	</noscript>
</body>
</html>
