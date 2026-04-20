# ---------- Stage 1: Build ----------
FROM node:20-alpine AS build

WORKDIR /app

#required env variables
ARG VITE_API_BASE_URL
ARG VITE_ASGARDEO_CLIENT_ID
ARG VITE_ASGARDEO_BASE_URL
ARG VITE_SIGNIN_REDIRECT_URL
ARG VITE_SIGNOUT_REDIRECT_URL

ENV VITE_API_BASE_URL=https://api-uat.emis.moe.gov.lk/api
ENV VITE_ASGARDEO_CLIENT_ID=7aLIstji17T7a00pSnE3UACo_fsa
ENV VITE_ASGARDEO_BASE_URL=https://api.asgardeo.io/t/airforce
ENV VITE_SIGNIN_REDIRECT_URL=https://app-uat.emis.moe.gov.lk/authentication/callback
ENV VITE_SIGNOUT_REDIRECT_URL=https://app-uat.emis.moe.gov.lk/logout


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
