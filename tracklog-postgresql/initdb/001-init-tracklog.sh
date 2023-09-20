#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    create role tracklog with login password 'tracklog';
    create database tracklog with owner tracklog;
EOSQL
