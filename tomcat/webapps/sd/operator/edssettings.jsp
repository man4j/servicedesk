<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="ru.naumen.core.server.JavaScriptConfiguration"%>
<%
ru.naumen.core.server.SpringContext ctx2=ru.naumen.core.server.SpringContext.getInstance();
JavaScriptConfiguration edsConf=ctx2.getBean(JavaScriptConfiguration.class);
String ua = request.getHeader("User-Agent");
boolean isIE = ua.matches("(.*)Trident/7.0(.*)") || ua.indexOf("MSIE") > -1;
%>
<%if(edsConf != null && edsConf.isEdsEnabled()){%>
	<script type="text/javascript" language="javascript"  src="../commons/wgxpath.install.js"></script>
	<script type="text/javascript" src="../commons/jquery-2.1.0.min.js"></script>
    <script type="text/javascript" src="../commons/NativeBridge.js"></script>
    <script type="text/javascript" src="../commons/es6-promise.min.js"></script>
    <script type="text/javascript" src="../commons/cadesplugin_api.js"></script>
    <script type="text/javascript" src="../commons/knockout-3.2.0.js"></script>
    <script type="text/javascript" src="../commons/lss-client.js"></script>
<%if(!isIE){%>
    <script type="text/javascript" src="../commons/async_code.js"></script>
<%}%>    
<%}%> 
