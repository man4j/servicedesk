<%/*$Id$*/%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<%@ page isELIgnored ="false" %>
<%@ page import="org.apache.commons.lang.StringUtils,
	org.apache.commons.lang.StringEscapeUtils,
    org.springframework.security.web.savedrequest.SavedRequest,
    org.springframework.security.web.WebAttributes,
    ru.naumen.core.server.Version,
    ru.naumen.sec.server.LogoService,
    ru.naumen.sec.server.LoginServlet,
    ru.naumen.sec.server.SDAuthenticationFailureHandler"%>
<%@ include file="i18n.jsp" %>
<%/* Страница логина*/ %>
<!DOCTYPE html>
<html>
<head>
	<%@ include file="meta_tags.jsp" %>
	<%@ include file="favicon.jsp" %>    
	<%@ include file="version.jsp" %>
	<%@ include file="themes.jsp" %>
	<link rel="stylesheet" href="${pageContext.request.contextPath}/login.css?v=1" type="text/css"/>
</head>
<body onload="placeholderCheck();">
	<%
    String errorKey = request.getParameter(ru.naumen.core.shared.Constants.ERROR_MESSAGE);
    Object errorMessageArguments = request.getSession().getAttribute(ru.naumen.core.shared.Constants.ERROR_MESSAGE_ARGUMENTS);
    request.getSession().removeAttribute(ru.naumen.core.shared.Constants.ERROR_MESSAGE_ARGUMENTS);
    String warningKey = request.getParameter(ru.naumen.core.shared.Constants.WARNING_MESSAGE);
    String username = "";
    if(SpringContext.getInstance().isCluster())
    {
    %>
   		<div id="nodeId" style="display: none;"><%=SpringContext.getInstance().getClusterNode()%></div>
    <%
    }
    if (errorKey != null)
    {
        if (session != null)
        {
            username = StringEscapeUtils.escapeHtml(StringUtils.trimToEmpty((String)session.getAttribute(LoginServlet.USER_NAME)));
        }
    %>
	<div id="errorMessage" class="b-login-text b-login-error">
		<spring:message code="<%=errorKey%>" arguments="<%=errorMessageArguments%>"/>
	</div>
	<%
    }
    else if (warningKey != null)
    {
        if (session != null)
        {
            username = StringEscapeUtils.escapeHtml(StringUtils.trimToEmpty((String)session.getAttribute(LoginServlet.USER_NAME)));
        }
    %>
	<div id="warningMessage" class="b-login-text b-login-warning">
		<spring:message code="<%=warningKey%>"/>
	</div><%
    }
    %>
	<div id="state.dispatch" style="display: none;" value="0"></div>
	<div id="state.context"  style="display: none;" value="ready"></div>

	<div class="b-login-form">
		<div class="b-login-form__padder">
			<div class="b-logo">
				<%/* Случайный параметр нужен чтобы убрать кэширование в Chrome и FF */%>
				<img id="logo" src="${pageContext.request.contextPath}/images/logo?id=<%=LogoService.getLoginPageLogoId()%>&login=true" alt="Naumen desc"/>
			</div>

			<form method="post" action="<%= application.getContextPath() %>/login" class="login-form">
				<div>
					<label id="usernameLabel" for="username" style="display: none;"><spring:message code="login"/></label>
					<input id="username" type="text" name="j_username"
						class="<%= errorKey != null ? "login-form__error" : ""%>" value="<%= username %>"
						placeholder="<spring:message code="login"/>"/> 
				</div>
				<div>
					<label id="passwordLabel" for="password" style="display: none;"><spring:message code="password"/></label>
					<input id="password" type="password" name="j_password"
						class="<%= errorKey != null ? "login-form__error" : ""%>"
						placeholder="<spring:message code="password"/>"/>
				</div>

				<input type="submit" value="<spring:message code="signIn"/>" class="submit-button"/>

				<spring:eval
					expression="@propertyConfigurer.getProperty('naupp.installation_link')"
					var="naupp_link"></spring:eval>
				<spring:eval
					expression="@propertyConfigurer.getProperty('naupp.visible') != \"true\" ? \"none\" : \"block\""
					var="naupp_link_visibility"></spring:eval>
				<spring:eval
					expression="@propertyConfigurer.getProperty('naupp.color')"
					var="naupp_link_color"></spring:eval>
				<div class="b-login-form__naupp-link" style="display: ${naupp_link_visibility}">
					<a href="${naupp_link}" style='color: ${naupp_link_color}'><spring:eval
						expression="@propertyConfigurer.getProperty('naupp.text')" /></a>
				</div>
			</form>

			<p class="b-login-form__footer-text">
				<%=Version.getFullVersion()%><br/>
				<spring:message code="company.copyright"/>
			</p>
		</div>
	</div>
	<script>
		function hide(id) {
			var elem = document.getElementById(id);
			if (elem) {
				elem.style.display = "none";
			}
		}
		function show(id) {
			var elem = document.getElementById(id);
			if (elem) {
				elem.style.display = "block";
			}
		}
		function resetFocus() {
			document.getElementById("username").focus();
		}
		resetFocus();
		
		<%/*Скрытие меток полей логина и пароля, в случае их автозаполнения*/%>
		function checkLabel(inputId) {
			if (document.getElementById(inputId).value.length > 0) {
				hide(inputId + 'Label');
			} else {
				show(inputId + 'Label');
			}
		}
		function checkLabels() {
			checkLabel('username');
			checkLabel('password');
		}
		function placeholderCheck() {
			var
				usernameInput = document.getElementById('username'),
				passwordInput = document.getElementById('password');

			if (!('placeholder' in document.createElement('input'))) {
				usernameInput.onkeyup =
					usernameInput.oninput =
					usernameInput.onpropertychange =
					passwordInput.onkeyup =
					passwordInput.oninput =
					passwordInput.onpropertychange = checkLabels;
				usernameInput.oncut = passwordInput.oncut = function() {
					setTimeout(checkLabels, 0);
				};
				resetFocus();
				checkLabels();
			}
		}
	</script>
</body>
</html>
