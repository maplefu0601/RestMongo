
NOW=$(date +"%Y%b%d")
FILE="/home/ubuntu/work/synaptop/logs/$NOW.synaptop.log"
ERROR="$FILE.error"

sudo forever start  -o $FILE -e $ERROR app.js

