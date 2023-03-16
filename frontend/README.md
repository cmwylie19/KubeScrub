# KubeScrub Dashboard

Configuration:

- ReadOnly
- Poll
- Watch (Objects)
- Poll Interval
- Version

Configuration is fetched from server.
Server is configured through command line options.
Operator configures command line options on Server deployment.


Build it 

```bash
docker build -t cmwylie19/kubescrub-ui:0.0.1 .
docker push cmwylie19/kubescrub-ui:0.0.1
```