import rocksdb

db = rocksdb.DB('data', rocksdb.Options(create_if_missing=True))
