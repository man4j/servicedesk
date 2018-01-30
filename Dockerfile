FROM tomcat:7.0-jre7-alpine
RUN apk add --no-cache msttcorefonts-installer curl jq && update-ms-fonts && fc-cache -f
COPY tomcat /usr/local/tomcat
COPY nausd40 /opt/nausd40
COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh
RUN rm -rf /usr/local/tomcat/webapps/docs
VOLUME ["/opt/nausd40/data","/opt/nausd40/logs","/usr/local/tomcat/logs"]
ENTRYPOINT ["/entrypoint.sh"]


