# Build the API as a static binary, then run it on a minimal image.
FROM golang:1.27-alpine AS build
WORKDIR /src
COPY . .
# The service uses the standard library only, so there is nothing to download.
RUN CGO_ENABLED=0 go build -trimpath -ldflags='-s -w' -o /out/server ./cmd/server

FROM alpine:3.24
RUN adduser -D -u 10001 app
COPY --from=build /out/server /usr/local/bin/server
USER app
ENV PORT=8080
EXPOSE 8080
# busybox wget ships with the base image.
HEALTHCHECK --interval=10s --timeout=3s --start-period=3s --retries=3 \
  CMD wget -q -O- http://127.0.0.1:8080/health || exit 1
ENTRYPOINT ["/usr/local/bin/server"]
