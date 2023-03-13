# KubeScrub

- [usage](#usage)

## Usage 

```
./kubescrub serve -p 8020 --watch "service,deployment"
```

## Architecture

The Frontend calls the backend config endpoint to get:
- Resources to watch (cm,secrets,service-account)
- poll
- poll-interval
- readOnly
- namespaced
- namespaces 

## Build

```bash
GOARCH=arm64 GOOS=linux go build -o kubescrub ./cmd/kubescrub
mv kubescrub build/kubescrub

docker build -t cmwylie19/kubescrub:0.0.1 build/
docker push cmwylie19/kubescrub:0.0.1
```

```bash
k create clusterrolebinding default-admin --clusterrole=cluster-admin --serviceaccount=default:default 

k run curler --image=nginx --rm -i --restart=Never -- curl kubescrub:8080/scrub/cm   
```