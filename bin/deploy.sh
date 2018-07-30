#!/bin/bash

rsync -avz -e ssh dist/ ${THP}
