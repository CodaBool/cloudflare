#!/bin/bash

aws configure set aws_access_key_id HERE
aws configure set aws_secret_access_key HERE
ACCOUNT_ID=711eb5718fbac6ce40d9482751fdfc64

BUCKET="logs"
keys=$(aws s3api list-objects-v2 --bucket $BUCKET --endpoint-url https://$ACCOUNT_ID.r2.cloudflarestorage.com --query "Contents[].Key" --output text )
filter=202311

for key in $keys; do
  if [[ $key == $filter* ]]; then
    day=$(echo "$key" | cut -c7-8)
    hour=$(echo "$key" | cut -c19-20)
    minute=$(echo "$key" | cut -c21-22)
    file_name="${day}_${hour}_${minute}"
    if [ -e "$file_name.json" ]; then
      echo "$file_name exists"
    else
      data=$(wrangler r2 object get $BUCKET/$key --pipe)
      log_size=$(echo "$data" | jq '.Logs | length')
      exec_size=$(echo "$data" | jq '.Exceptions | length')
      if [ "$log_size" -eq 0 ] && [ "$exec_size" -eq 0 ]; then
        echo "$file_name empty"
      else
        echo "$file_name new"
        echo "$data" > $file_name.json
      fi
    fi
  fi
done
