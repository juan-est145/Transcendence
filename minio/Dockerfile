FROM  quay.io/minio/minio:latest AS dev

WORKDIR /root

COPY entrypoint.sh .

RUN curl -L https://github.com/minio/certgen/releases/latest/download/certgen-linux-amd64 -o certs.out && \
	chmod 760 certs.out && mkdir -p /etc/ssl/certs && ./certs.out -host "127.0.0.1,localhost,minio" && \
	mv -t /etc/ssl/certs public.crt private.key && chmod 764 entrypoint.sh

EXPOSE 9000

EXPOSE 9001

ENTRYPOINT [ "./entrypoint.sh" ]

FROM  quay.io/minio/minio:latest AS prod

EXPOSE 9000

EXPOSE 9001

CMD ["server", "/data", "--anonymous", "--quiet" ,"--console-address", ":9001"]