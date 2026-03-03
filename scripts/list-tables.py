import sys, json
d = json.load(sys.stdin)
paths = [k for k in d.get("paths", {}).keys() if k != "/"]
print(paths)
