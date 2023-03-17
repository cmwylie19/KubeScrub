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

## Quick Clean/Deploy

```bash
kind delete clusters --all
# docker images | awk 'FNR == 2  {print $3}' |  xargs docker rmi

cat <<EOF | kind create cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 31469 #NodePort of NGINX service
    hostPort: 8080
    protocol: TCP
EOF
# GOARCH=arm64 GOOS=linux go build -o kubescrub ./cmd/kubescrub
# mv kubescrub build/kubescrub
sleep 10;
# docker build -t cmwylie19/kubescrub:0.0.1 build/
# docker push cmwylie19/kubescrub:0.0.1
kubectl apply -f deploy.yaml
kubectl create sa default
kubectl run n --image=nginx --port=80 --expose
kubectl create ing n --class="nginx" --rule="/*=n:80"
sleep 15;
k logs -f kubescrub 
```
