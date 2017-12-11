export MONGO_DATA=/Users/hyakuhei/Code/Heimdall/heimdall/mongodata
docker run -d -p 27017:27017 -v $MONGO_DATA:/data/db mongo
