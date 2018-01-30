<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%><%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<?xml version="1.0" encoding="UTF-8" ?><%/*$Id$*/%>
<!DOCTYPE html><%/*Виджет livechat, который встраивается на сайт.*/ %>
<html>
<head>
<meta name="gwt:property" content="module=chat"/>
<%@ include file="../meta_tags.jsp" %>
<%@ include file="../favicon.jsp"%>
<%@ include file="../version.jsp" %>
<%@ include file="../i18n.jsp" %>
<%@ include file="chatCommon.jsp" %>
<%@ include file="p3p.jsp" %>
    <script type="text/javascript" language="javascript" 
      src="chat.nocache.js?<%= ru.naumen.core.shared.utils.UUIDGenerator.get().nextUUID() %>"></script>
</head>

<body id="chatModule">
    <iframe src="javascript:''" id="__gwt_historyFrame" tabIndex='-1' style="position:absolute;width:0;height:0;border:0"></iframe>
    <div id="AtestInterfaceChat" style="display: none;" ></div>
    
    <noscript>
      <div style="width: 22em; position: absolute; left: 50%; margin-left: -11em; color: red; background-color: white; border: 1px solid red; padding: 4px; font-family: sans-serif">
        <spring:message code="must.have.javascipt"/>        
      </div>
    </noscript>
</body>
</html>