#!/usr/bin/python3

import binascii
import struct
import json
import shutil

from db import db
from rpc import rpc


def process_transactions(blockhash: str):
    block = rpc.getblock(blockhash)
    strippedsize = block['strippedsize']
    size = block['size']
    weight = block['weight']
    txtotal = len(block['tx'])
    txsegwit = 0
    for i, txid in enumerate(block['tx']):
        if i > 0 and i % 100 == 0:
            print('  * tx: %d/%d (%.2f%%)' % (i, txtotal, 100.0 * i / txtotal))
        txraw = rpc.getrawtransaction(txid, False)
        if txraw[8:12] == '0001':  # segwit tx has 0 inputs and 1 output
            txsegwit += 1
    k = b'HASH' + binascii.unhexlify(blockhash)
    v = struct.pack('>IIIII', strippedsize, size, weight, txtotal, txsegwit)
    db.put(k, v)
    print('* data: strippedsize=%d size=%d weight=%d txtotal=%d txsegwit=%d' % (strippedsize, size, weight, txtotal, txsegwit))


def process_block(height: int, blockhash: str):

    print('processing block: height=%d hash=%s' % (height, blockhash))

    height_bin = b'HGHT' + struct.pack('>I', height)
    blockhash_bin = binascii.unhexlify(blockhash)
    h = db.get(height_bin)

    if h is not None and h == blockhash_bin and db.get(b'HASH' + blockhash_bin):
        # block already seen and processed
        print('* already seen and processed')
        return

    if h is not None and h != blockhash_bin:
        # seen another block with this height, delete old info
        print('* reorg')
        db.delete(b'HASH' + h)

    else:
        # this is new block
        print('* new block')

    db.put(height_bin, binascii.unhexlify(blockhash))

    process_transactions(blockhash)


SEGWIT_START = 481824

blockcount = rpc.getblockcount()

for height in range(blockcount, SEGWIT_START - 1, -1):
    blockhash = rpc.getblockhash(height)
    process_block(height, blockhash)
    print()

data = []
for height in range(blockcount, SEGWIT_START - 1, -1):
    height_bin = b'HGHT' + struct.pack('>I', height)
    h = db.get(height_bin)
    v = db.get(b'HASH' + h)
    strippedsize, size, weight, txtotal, txsegwit = struct.unpack('>IIIII', v)
    data.append({
        'height': height,
        'hash': binascii.hexlify(h).decode(),
        'strippedsize': strippedsize,
        'size': size,
        'weight': weight,
        'txtotal': txtotal,
        'txsegwit': txsegwit,
    })

shutil.copyfile('data.json', 'data.json.last')
json.dump(data, open('data.json', 'wt'), indent=2, sort_keys=True)
