FROM imagenarium/oracle:11gR2_6
COPY imagenarium-entrypoint.sh /
COPY entrypoint_oracle.sh /assets/
RUN chmod +x /imagenarium-entrypoint.sh && chmod +x /assets/entrypoint_oracle.sh
ENTRYPOINT ["/imagenarium-entrypoint.sh"]