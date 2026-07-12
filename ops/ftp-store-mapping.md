# FTP store mapping

Production FTP folders should map to stores as follows:

| FTP user | Home folder | Store |
| --- | --- | --- |
| `postftp` | `/home/postftp` | `storeId=2` Status |
| `dosftp` | `/home/dosftp` | `storeId=1` Dosstore |

The worker must preserve processed and failed handling inside each store folder:

```text
/home/postftp/processed
/home/postftp/failed
/home/dosftp/processed
/home/dosftp/failed
```

Run on the FTP VPS as root or with sudo:

```bash
sudo bash ops/setup-dosstore-ftp.sh
sudo passwd dosftp
```

If the FTP worker runs under a non-root service account, pass it to the setup script so it can read both folders:

```bash
sudo WORKER_USER=<worker-linux-user> bash ops/setup-dosstore-ftp.sh
sudo passwd dosftp
```

The setup script writes this mapping file for worker configuration:

```text
/etc/ers-group/ftp-store-map.json
```

Expected mapping content:

```json
{
  "stores": [
    {
      "storeId": 2,
      "storeName": "Status",
      "ftpUser": "postftp",
      "path": "/home/postftp",
      "processedPath": "/home/postftp/processed",
      "failedPath": "/home/postftp/failed"
    },
    {
      "storeId": 1,
      "storeName": "Dosstore",
      "ftpUser": "dosftp",
      "path": "/home/dosftp",
      "processedPath": "/home/dosftp/processed",
      "failedPath": "/home/dosftp/failed"
    }
  ]
}
```
