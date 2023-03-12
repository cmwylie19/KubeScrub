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

