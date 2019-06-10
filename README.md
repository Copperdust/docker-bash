In order to install:

`npm install -g docker-bash`

***

![](https://raw.githubusercontent.com/Copperdust/docker-bash/master/example.gif)

***

This utility simplifies the process of running bash / SSHing into a container. In order to do so, just run the tool `docker-bash` and select which of the running containers you want to connect to. Alternatively, you can add a filter word to the command, e.g. `docker-bash db` and it will fuzzy-match/filter between the container NAMES (_not_ IDs). If it detects only one match, it'll connect to it automatically (it will ask for confirmation if the match is less than 100% certain), if there are multiple matches, it'll give you the option to select from the thinned down list.
