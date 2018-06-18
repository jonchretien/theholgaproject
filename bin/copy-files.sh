#!/bin/bash

# declare variables
dir=$1
items='index.html'

# remove directory contents
rm -rf $dir

# create directory
mkdir $dir

# copy items
for item in $items
do
    cp -r {src,$dir}/$item
done

echo Copying done
