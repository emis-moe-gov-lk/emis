# ---------- Stage 1: Build ----------
FROM node:20-alpine AS build

WORKDIR /app

# Vite bakes VITE_* into the JS bundle at build time. Caller passes these
# via --build-arg (or the `args:` block in docker-compose.local.yml). ARG
# declarations bring the build args into scope; ENV promotes each one so the
# Vite build process picks them up.
ARG VITE_API_BASE_URL
ARG VITE_ASGARDEO_CLIENT_ID
ARG VITE_ASGARDEO_BASE_URL
ARG VITE_SIGNIN_REDIRECT_URL
ARG VITE_SIGNOUT_REDIRECT_URL

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_ASGARDEO_CLIENT_ID=${VITE_ASGARDEO_CLIENT_ID}
ENV VITE_ASGARDEO_BASE_URL=${VITE_ASGARDEO_BASE_URL}
ENV VITE_SIGNIN_REDIRECT_URL=${VITE_SIGNIN_REDIRECT_URL}
ENV VITE_SIGNOUT_REDIRECT_URL=${VITE_SIGNOUT_REDIRECT_URL}


COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build


# ---------- Stage 2: Nginx ----------
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
