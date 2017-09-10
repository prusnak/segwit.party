import bitcoin.rpc

try:
    from rpc_credentials import RPC_HOST, RPC_PORT, RPC_USER, RPC_PASS
    rpc = bitcoin.rpc.RawProxy(service_url='http://%s:%s@%s:%d' % (RPC_USER, RPC_PASS, RPC_HOST, RPC_PORT))
except:
    rpc = bitcoin.rpc.RawProxy()
