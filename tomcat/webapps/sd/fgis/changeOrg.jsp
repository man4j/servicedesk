<%@page import="com.google.common.base.Strings"%>
<%@page import="ru.naumen.sec.server.oauth2.OAuth2Configuration"%>
<%@page import="java.util.List"%>
<%@page import="java.util.Map"%>
<%@page import="com.google.gson.Gson"%>
<%@page import="ru.naumen.commons.shared.utils.Base64"%>
<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!doctype html>
<html>
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta charset="utf-8">
    <title>Портал государственных услуг Российской Федерации</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="shortcut icon" href="favicon.ico">
    <link rel="apple-touch-icon" href="img/icons/iphone/ico120.png">
    <link rel="apple-touch-icon" sizes="76x76" href="img/icons/iphone/ico76.png">
    <link rel="apple-touch-icon" sizes="120x120" href="img/icons/iphone/ico120.png">
    <link rel="apple-touch-icon" sizes="152x152" href="img/icons/iphone/ico152.png">

    <meta name="description" content="Портал государственных услуг Российской Федерации"/>
    <meta name="apple-mobile-web-app-title" content="Госуслуги">

    <link rel="stylesheet" href="css/styles.css">
    <!--[if lt IE 9]><script src="js/html5shiv.js"></script><![endif]-->
</head>
<body class="page-login">
    <div class="page">
        <header class="grid position_fixed">
            <div class="top">
                <ul class="container nav-panel list">
                    <li class="item col1">
                        <a id="logo" href="/" class="ng-scope">
                            <h1>ЕПГУ</h1>
                        </a>
                    </li>
                    <li class="item col3">
                    </li>
                </ul>
            </div>
            <div class="bottom">
                <ul class="container bcrumb">
                    <li class="home item item1">
                        <a href="<%=request.getParameter("mainLink")%>">Досудебное обжалование</a>
                    </li>
                    <li class="home item item2 last">
                        <span>Выбор роли</span>
                    </li>
                </ul>
            </div>
        </header>
        <div class="page_contant">
            <h2 class="main-title">Войти как</h2>

            <ul class="list choose-login-type">
            	<%String base64User = request.getParameter("user");
				  String userJson = Base64.jwsBase64ToString(base64User);
				  System.out.println(userJson);
				  Map user = new Gson().fromJson(userJson, Map.class);%>
					<li class="item item1">
						<form action="<%=OAuth2Configuration.getInstance().getBaseUrl() + OAuth2Configuration.LOGIN_URL%>" method="post" id="naturalUser">
							<input name="ESIA_ORG_ID" value="naturalUser" type="hidden" />
							<a href="#" class="person">
								<div class="person_type">Частное лицо</div>
								<div class="person_name"><%=user.get("lastName") + " "+ user.get("firstName") + " " + user.get("middleName") %></div>
							</a>
						</form>
					</li>
				<%
				    String base64Orgs = request.getParameter("orgs");
				    if (!Strings.isNullOrEmpty(base64Orgs))
				    {
				        String orgsJson = Base64.jwsBase64ToString(base64Orgs);
				        System.out.println(orgsJson);
				        List<Map> orgs = new Gson().fromJson(orgsJson, List.class);
				        for (int i = 0; i < orgs.size(); ++i)
				        {
				            Map org = orgs.get(i);
				%>
						<li class="item item<%="AGENCY".equals(org.get("type"))?"3":"2"%><%=i==orgs.size()-1?" last":""%>">
							<form action="<%=OAuth2Configuration.getInstance().getBaseUrl() + OAuth2Configuration.LOGIN_URL%>" method="post" id="<%=org.get("oid")%>">
								<input name="ESIA_ORG_ID" value="<%=org.get("oid")%>" type="hidden" />
								<a href="#" class="person">
									<div class="person_type"><%=org.get("post")%></div>
                        			<div class="person_name"><%=org.get("shortName")%></div>
								</a>
							</form>
						</li>
				      <%}
				  } %>
            </ul>
            <p class="help">
            </p>
        </div>
    </div>
    <footer>
        <div class="container">
            <div class="unit col1">
                <p>Официальный интернет-портал государственных услуг, 2015 г.</p>
            </div>
            <div class="unit col3"></div>
            <div class="unit col2">
            </div>
        </div>
    </footer>
    <div id="mask" class="mask none">
        <h2>Идет загрузка</h2>
        <h3>Это может занять некоторое время</h3>
        <div class="loader"></div>
    </div>
    <script src="js/jquery-2.1.1.min.js"></script>
    <script src="js/bowser.min.js"></script>
    <script>$(function(){
        var img=new Image();
        img.src='img/loader_big.gif';
        function fix_mask() {
            $('#mask').height($('body').height() - $('footer').height() + 'px');
        }
        $('a.person').click(function(e){
            e.preventDefault();
            $('.page_contant').hide();
            if (!bowser.msie && !bowser.safari)
                $('body').addClass('show-loader');
            fix_mask();
            $('#mask').fadeIn();
            $(window).resize(function(){
                fix_mask();
            });
            $(window).resize();
            var $form = $(this).parent('form'); 
            window.setTimeout(function(){
                $form.submit();
            }, 300);
            return false;
        });
    });</script>
</body>
</html>