FROM  quay.io/minio/minio:latest AS dev

EXPOSE 9000

EXPOSE 9001

CMD ["server", "/data", "--console-address", ":9001"]

FROM  quay.io/minio/minio:latest AS prod

EXPOSE 9000

EXPOSE 9001

CMD ["server", "/data", "--anonymous", "--quiet" ,"--console-address", ":9001"]