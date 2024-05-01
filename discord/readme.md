# discord bot

## DEPRECATED
The runtime that Cloudflare workers has is missing many of the libraries (i.e. crypto) which are needed to perform an SSH. I have moved to Lambda with a Docker image deployment instead (in my AWS repo).


### .dev.vars
I'm using the Scraper Discord bot that already exists in my account.

```
TOKEN=
APP_ID=
SERVER_IP=
SSH_PASSWORD=
```

### minecraft
/opt/minecraft/tools/mcrcon/mcrcon -p p "whitelist add testme"
/opt/minecraft/tools/mcrcon/mcrcon -p p "whitelist remove testme"