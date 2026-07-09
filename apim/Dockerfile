# Use the official WSO2 API Manager base image
FROM wso2/wso2am:4.6.0

# Switch to root to handle file permissions
USER root

# MySQL JDBC Driver to the lib directory
COPY --chown=wso2carbon:wso2 \
    lib/*.jar \
    ${WSO2_SERVER_HOME}/repository/components/lib/

# Replace the default deployment.toml with your custom one
COPY --chown=wso2carbon:wso2 \
    conf/deployment.toml \
    ${WSO2_SERVER_HOME}/repository/conf/

# Trust any additional certificates dropped into certs/ (one .pem per CA).
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

# ── Infisical CLI ──────────────────────────────────────────────
ARG INFISICAL_URL
ENV INFISICAL_URL=$INFISICAL_URL

ARG INFISICAL_CLI_VERSION=0.43.103
RUN curl -fsSL \
    "https://github.com/Infisical/cli/releases/download/v${INFISICAL_CLI_VERSION}/cli_${INFISICAL_CLI_VERSION}_linux_amd64.tar.gz" \
    -o /tmp/infisical.tar.gz \
    && tar xzf /tmp/infisical.tar.gz -C /usr/local/bin infisical \
    && rm /tmp/infisical.tar.gz \
    && chmod +x /usr/local/bin/infisical

# Custom entrypoint: wraps startup with `infisical run` to inject secrets
COPY --chmod=0555 docker-entrypoint.sh /docker-entrypoint.sh

# Switch back to the non-root wso2carbon user
USER wso2carbon

ENTRYPOINT ["/docker-entrypoint.sh"]

# Expose the standard ports
EXPOSE 9443 8243 8280
