<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%
    String agent = request.getHeader("User-Agent");
    boolean isIE = agent.matches("(.*)Trident(.*)");
    if(isIE)
    { 
        //Так как чат открывается в  iframe, в IE проставляем header P3P,
        // чтобы браузер разрешил запись в Cookie идентификатора http-сессии. 
        //Значение неважно какое, поэтому Potato =)
        //Приятного аппетита, Internet Explorer!
        response.addHeader("P3P", "CP=\"Potato\"");
    }
%>
