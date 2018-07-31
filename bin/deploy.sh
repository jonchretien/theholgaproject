#!/bin/bash

rsync -avz -e ssh dist/ ${SITE_THP}
