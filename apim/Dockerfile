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

# Switch back to the non-root wso2carbon user
USER wso2carbon

# Expose the standard ports
EXPOSE 9443 8243 8280
