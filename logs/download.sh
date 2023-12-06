#!/bin/bash

# load env file
source ./.dev.vars

aws configure set aws_access_key_id $R2_ACCESS_KEY_ID
aws configure set aws_secret_access_key $R2_SECRET_ID
ACCOUNT_ID=711eb5718fbac6ce40d9482751fdfc64

BUCKET="logs"
keys=$(aws s3api list-objects-v2 --bucket $BUCKET --endpoint-url https://$ACCOUNT_ID.r2.cloudflarestorage.com --query "Contents[].Key" --output text )

filter=20231206 # year month, can be expanded or limited to the day

mkdir -p junk

for key in $keys; do
  if [[ $key == $filter* ]]; then
    # day=$(echo "$key" | cut -c7-8)
    hour=$(echo "$key" | cut -c19-20)
    minute=$(echo "$key" | cut -c21-22)
    second=$(echo "$key" | cut -c23-24)
    # file_name="${day}_${hour}_${minute}_${second}"
    file_name="${hour}_${minute}_${second}"
    if [ -e "junk/$file_name.json" ]; then
      echo "$file_name exists"
    else
      data=$(wrangler r2 object get $BUCKET/$key --pipe)

      log_size=$(echo "$data" | jq '.Logs | length')
      exec_size=$(echo "$data" | jq '.Exceptions | length')

      useless_log=1

      while IFS= read -r length; do
        if [ $length -ne 0 ]; then
          useless_log=0
          break
        fi
      done <<< "$log_size"

      while IFS= read -r length; do
        if [ $length -ne 0 ]; then
          useless_log=0
          break
        fi
      done <<< "$exec_size"

      if [ $useless_log -eq 0 ]; then
        echo "$file_name new"
        echo "$data" | jq . > junk/$file_name.json
      else
        echo "$file_name empty"
      fi
    fi
  fi
done
