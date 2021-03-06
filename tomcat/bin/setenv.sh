CLASSPATH="$JAVA_HOME"/lib/tools.jar
HTTP_PORT="8080"
JMX_PORT="10108"
IP_ADDR="${SERVICE_NAME}"
CATALINA_OPTS=${APP_OPTS}" -server
-Djava.security.egd=file:/dev/./urandom
-Dfile.encoding=UTF-8
-Dext.prop.dir=/opt/nausd40/conf
-Djava.net.preferIPv4Stack=true
-Dhttp.port=$HTTP_PORT
-XX:PermSize=2048m
-XX:MaxPermSize=2048m
-Duser.language=ru
-Duser.region=RU
-Xloggc:/opt/nausd40/tomcat/logs/gc.log
-XX:ReservedCodeCacheSize=1024000k
-XX:+UseParallelOldGC
-XX:+PrintGCDetails
-XX:+PrintGCTimeStamps
-XX:+PrintGCDateStamps
-Djava.rmi.server.hostname=$IP_ADDR
-Dcom.sun.management.jmxremote.port=$JMX_PORT
-Dcom.sun.management.jmxremote.ssl=false
-Dcom.sun.management.jmxremote.authenticate=false"
