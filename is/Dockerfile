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

# Expose the default ports
EXPOSE 9443 8243 8280

# The entrypoint is inherited from the base image #=>
