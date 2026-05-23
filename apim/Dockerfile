# Use the official WSO2 API Manager base image
FROM wso2/wso2am:4.6.0

# Switch to root to handle file permissions
USER root

# MySQL JDBC Driver to the lib directory
# Assume 'lib' is present in the build context
COPY --chown=wso2carbon:wso2 \
    lib/*.jar \
    ${WSO2_SERVER_HOME}/repository/components/lib/

# 2. Replace the default deployment.toml with your custom one
# This file should contain your MySQL and IS Key Manager configs
COPY --chown=wso2carbon:wso2 \
    conf/deployment.toml \
    ${WSO2_SERVER_HOME}/repository/conf/

# 3. Trust any additional certificates dropped into certs/ (one .pem per CA).
# Empty in prod; local-dev fills it with the nginx-proxy self-signed cert so
# APIM trusts the proxy when calling IS over the public hostname. Imports into
# both the WSO2 client-truststore (used by most clients) AND the JVM default
# cacerts (used by Feign in the IS7 key manager client, which has its own SSL
# context).
COPY --chown=root:root --chmod=0444 certs/ /tmp/extra-certs/
RUN set -e; \
    for cert in /tmp/extra-certs/*.pem; do \
      [ -f "$cert" ] || continue; \
      alias_name="emis-$(basename "$cert" .pem)"; \
      echo "Importing $cert as $alias_name into client-truststore.p12 + cacerts"; \
      keytool -import -trustcacerts -noprompt \
        -alias "$alias_name" \
        -file "$cert" \
        -keystore ${WSO2_SERVER_HOME}/repository/resources/security/client-truststore.p12 \
        -storepass wso2carbon -storetype PKCS12; \
      keytool -import -trustcacerts -noprompt \
        -alias "$alias_name" \
        -file "$cert" \
        -keystore ${WSO2_SERVER_HOME}/repository/resources/security/client-truststore.jks \
        -storepass wso2carbon; \
      keytool -import -trustcacerts -noprompt \
        -alias "$alias_name" \
        -file "$cert" \
        -keystore ${JAVA_HOME}/lib/security/cacerts \
        -storepass changeit; \
    done; \
    rm -rf /tmp/extra-certs

# Switch back to the non-root wso2carbon user
USER wso2carbon

# Expose the standard ports
EXPOSE 9443 8243 8280
