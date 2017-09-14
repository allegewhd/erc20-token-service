#!/usr/bin/env bash

set -e

GETH_CMD=geth

if ! ${GETH_CMD} version > /dev/null 2>&1; then
    echo "ERROR - require ${GETH_CMD} command in PATH variable."
    exit 1
fi


SCRIPT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DATA_ROOT=${SCRIPT_PATH}/data
DATA_PATH=${DATA_ROOT}/dev
IPC_FILE=${DATA_PATH}/geth.ipc

NODE_NAME="DEV_NODE"

echo "attach ${NODE_NAME} by ipc: ${IPC_FILE}"

echo ${GETH_CMD} attach ipc:${IPC_FILE}
${GETH_CMD} attach ipc:${IPC_FILE}
