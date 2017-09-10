#!/usr/bin/env python3
from datetime import datetime, timedelta

days = input()

d = datetime.utcnow() + timedelta(days=float(days))

print(d.isoformat()[:-7] + '+0000')
