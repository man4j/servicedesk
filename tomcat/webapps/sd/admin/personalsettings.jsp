<%@page import="ru.naumen.core.shared.utils.ILocaleInfo"%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="ru.naumen.core.server.SpringContext"%><%
SpringContext context=SpringContext.getInstance();
ru.naumen.core.server.dispatch.PersonalSettingsHelper service=context.getBean(ru.naumen.core.server.dispatch.PersonalSettingsHelper.class);
ru.naumen.core.shared.personalsettings.PersonalSettings settings = service.getSettings(context.getCurrentUserUuid());
String currentTheme = "blue";
if(settings != null){
  currentTheme = settings.getThemeOperator();%>
  <meta name="gwt:property" content="theme=<%= settings.getThemeAdmin()%>"/>
  <meta name="gwt:property" content="locale=<%= "client".equals(settings.getLocale()) ? "ru" : settings.getLocale()%>"/>
  <meta name="gwt:property" content="isClientLocale=<%= "client".equals(settings.getLocale())%>"/>
  <meta name="gwt:property" content="compiler.stackMode=<%= settings.getGwtStackMode()%>"/>
<%}
else{%>
    <meta name="gwt:property" content="theme=blue"/>
    <meta name="gwt:property" content="locale=ru"/>  
    <meta name="gwt:property" content="isClientLocale=false"/>
    <meta name="gwt:property" content="compiler.stackMode=strip"/>
<%}
String ajaxLoaderAnimPath = "scheme5".equalsIgnoreCase(currentTheme) ? "../ajax-loading-scheme5.gif" : "../ajax-loading.gif";
%>