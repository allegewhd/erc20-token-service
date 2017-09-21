#!/usr/bin/env bash

set -e

GETH_CMD=geth

if ! ${GETH_CMD} version > /dev/null 2>&1; then
    echo "ERROR - require ${GETH_CMD} command in PATH variable."
    exit 1
fi

# parse command line arguments
RESET_DATA=false
MINING_ENABLE=false
while [ $# -ge 1 ]; do
    key="$1"

    case $key in
        -r|--reset)
            RESET_DATA=true
            ;;
        -m|--mining)
            MINING_ENABLE=true
            ;;
        *)
            echo "unknown option ${key}"
            echo "Usage: ./start.sh [-r|--reset] [-m|--mining] "
            echo "[-r|--reset] clear blockchain data and init genesis before start console"
            echo "[-m|--mining] start geth with mining enabled"
            exit 1
            ;;
    esac

    shift
done

# set geth options
SCRIPT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DATA_ROOT=${SCRIPT_PATH}/data
DAG_PATH=${DATA_ROOT}/ethdash
DATA_PATH=${DATA_ROOT}/dev
GENESIS_FILE=${SCRIPT_PATH}/genesis.json
KEYSTORE_PATH=${DATA_PATH}/keystore
PASSWORD_FILE=${SCRIPT_PATH}/account_unlock_pass

DAG_OPT="--ethash.dagdir ${DAG_PATH}"

NODE_NAME="DEV_NODE"
RPC_PORT=8011
PORT=30311
IPC_API="admin,db,eth,debug,miner,net,shh,txpool,personal,web3"
RPC_API="db,eth,net,personal,web3"
NETWORK_ID=951056
# Logging verbosity: 0-6 (0=silent, 1=error, 2=warn, 3=info, 4=core, 5=debug, 6=debug detail)
LOG_LEVEL=3
MAX_PEERS=2
PRIMARY_ACCOUNT="0xc3e836ea59dd855469cd2059e531ddcdbceac78f"
MINING_ACCOUNT="0xe169dc2cf67b86096ca50bf1371464542c73f5bc"
UNLOCK_OPT="--unlock ${PRIMARY_ACCOUNT} --password ${PASSWORD_FILE}"

if [ "${MINING_ENABLE}" == true ]; then
    MINING_OPT="--mine --minerthreads 1 --gasprice 0 --etherbase ${MINING_ACCOUNT} --extradata ${NODE_NAME}"
else
    MINING_OPT="--gasprice 0 --etherbase ${MINING_ACCOUNT} --extradata ${NODE_NAME}"
fi

if [ ! -d ${DATA_PATH} ]; then
    echo mkdir -p ${DATA_PATH}
    mkdir -p ${DATA_PATH}
fi

if [ ! -d ${KEYSTORE_PATH} ]; then
    echo mkdir -p ${KEYSTORE_PATH}
    mkdir -p ${KEYSTORE_PATH}

    for f in `ls ${SCRIPT_PATH}/UTC-*`; do
        echo "copy $f to ${KEYSTORE_PATH} ..."
        cp -f $f ${KEYSTORE_PATH}/
    done
fi

if [ ! -d ${DAG_PATH} ]; then
    echo mkdir -p ${DAG_PATH}
    mkdir -p ${DAG_PATH}
fi

if [ ! -d ${DATA_PATH}/geth ] || [ ${RESET_DATA} = true ]; then
    if [ -d ${DATA_PATH}/geth ]; then
        for f in `ls $DATA_PATH`
        do
            if [ "$f" = "keystore" ]; then
                echo "skip keystore folder ..."
            else
                echo "delete $DATA_PATH/$f ..."
                rm -rf $DATA_PATH/$f
            fi
        done
    fi

    echo ${GETH_CMD} --datadir "${DATA_PATH}" --keystore "${KEYSTORE_PATH}" init "${GENESIS_FILE}"
    ${GETH_CMD} --datadir "${DATA_PATH}" --keystore "${KEYSTORE_PATH}" init "${GENESIS_FILE}"
fi

echo ${GETH_CMD} --datadir "${DATA_PATH}" --keystore "${KEYSTORE_PATH}" ${DAG_OPT} --identity "${NODE_NAME}" --rpc --rpcport ${RPC_PORT} --rpccorsdomain "*" --port ${PORT} --nodiscover --rpcapi "${RPC_API}" --networkid ${NETWORK_ID} ${UNLOCK_OPT} ${MINING_OPT} --verbosity ${LOG_LEVEL} --maxpeers ${MAX_PEERS} --nat "any" console

${GETH_CMD} --datadir "${DATA_PATH}" --keystore "${KEYSTORE_PATH}" ${DAG_OPT} --identity "${NODE_NAME}" --rpc --rpcport ${RPC_PORT} --rpccorsdomain "*" --port ${PORT} --nodiscover --rpcapi "${RPC_API}" --networkid ${NETWORK_ID} ${UNLOCK_OPT} ${MINING_OPT} --verbosity ${LOG_LEVEL} --maxpeers ${MAX_PEERS} --nat "any" console
