<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%><%/*$Id$*/ %>
<%@ page import="org.apache.commons.lang.math.RandomUtils,
	ru.naumen.core.server.SpringContext,
	ru.naumen.metainfo.server.MetainfoService,
	ru.naumen.core.shared.Constants"%>
<%    
      SpringContext sprngCtx = SpringContext.getInstance();
      MetainfoService metainfSrv = sprngCtx.getBean(ru.naumen.metainfo.server.MetainfoService.class);
      boolean isStandardFavicon = true;
      if (metainfSrv.getInterfaceSettings() != null && metainfSrv.getInterfaceSettings().getFaviconSettings() != null)
      {
          isStandardFavicon = metainfSrv.getInterfaceSettings().getFaviconSettings().isFaviconStandard();
      }
      if (isStandardFavicon)
      {
          %>
          <link rel="icon" href="<%=sprngCtx.getContextPath()%>/<%=Constants.DEFAULT_FAVICON%>?id=<%=RandomUtils.nextInt()%>" type="image/x-icon" />
	<link rel="shortcut icon" href="<%=sprngCtx.getContextPath()%>/<%=Constants.DEFAULT_FAVICON%>?id=<%=RandomUtils.nextInt()%>" type="image/x-icon" />
          <% 
      }
      else
      {
          %>
          <link rel="icon" href="<%=sprngCtx.getContextPath()%>/<%=Constants.CUSTOM_FAVICON%>?id=<%=RandomUtils.nextInt()%>" type="image/x-icon" />
	<link rel="shortcut icon" href="<%=sprngCtx.getContextPath()%>/<%=Constants.CUSTOM_FAVICON%>?id=<%=RandomUtils.nextInt()%>" type="image/x-icon" />
          <% 
      }
%>