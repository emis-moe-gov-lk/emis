# Official WSO2 Identity Server 7.2.0 as the base image
FROM wso2/wso2is:7.2.0

# default working directory (WSO2_HOME -> /home/wso2carbon/wso2is-7.2.0)
WORKDIR /home/wso2carbon/wso2is-7.2.0

# Replace 'deployment.toml' file
# Assumes you have 'conf/deployment.toml' in your build context
COPY --chown=wso2carbon:wso2carbon conf/deployment.toml repository/conf/deployment.toml

# 2. Add custom JAR files (libraries)
# required for Key Manager connectors and Conencting to external MySQL DB
# Assumes you have 'lib/' 'dropins/' dirs in your build context
COPY --chown=wso2carbon:wso2carbon dropins/*.jar repository/components/dropins
COPY --chown=wso2carbon:wso2carbon lib/*.jar repository/components/lib

# 3. Trust any additional certificates dropped into certs/ (one .pem per CA).
# Empty in prod; local-dev fills it with the nginx-proxy self-signed cert so
# IS trusts the proxy when calling APIM over the public hostname. Imports into
# both the WSO2 client-truststore and the JVM default cacerts (the latter is
# root-owned, hence the USER root switch).
USER root
COPY --chown=wso2carbon:wso2carbon --chmod=0444 certs/ /tmp/extra-certs/
RUN set -e; \
    for cert in /tmp/extra-certs/*.pem; do \
      [ -f "$cert" ] || continue; \
      alias_name="emis-$(basename "$cert" .pem)"; \
      echo "Importing $cert as $alias_name into client-truststore.p12 + cacerts"; \
      keytool -import -trustcacerts -noprompt \
        -alias "$alias_name" \
        -file "$cert" \
        -keystore repository/resources/security/client-truststore.p12 \
        -storepass wso2carbon -storetype PKCS12; \
      keytool -import -trustcacerts -noprompt \
        -alias "$alias_name" \
        -file "$cert" \
        -keystore ${JAVA_HOME}/lib/security/cacerts \
        -storepass changeit; \
    done; \
    rm -rf /tmp/extra-certs
USER wso2carbon

# Expose the default ports
EXPOSE 9443 8243 8280

# The entrypoint is inherited from the base image #=>
