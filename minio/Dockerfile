FROM  quay.io/minio/minio:latest AS dev

WORKDIR /root

RUN curl -L https://github.com/minio/certgen/releases/latest/download/certgen-linux-amd64 -o certs.out && \
	chmod 760 certs.out && mkdir -p /etc/ssl/certs && ./certs.out -host "127.0.0.1,localhost,minio" && \
	mv -t /etc/ssl/certs public.crt private.key

EXPOSE 9000

EXPOSE 9001

CMD ["server", "/data", "--console-address", ":9001", "-S", "/etc/ssl/certs"]

FROM  quay.io/minio/minio:latest AS prod

EXPOSE 9000

EXPOSE 9001

CMD ["server", "/data", "--anonymous", "--quiet" ,"--console-address", ":9001"]