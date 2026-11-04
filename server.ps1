# ALIANSI STORE - Zero-Dependency Local Web Server
# Port 5050 (Bebas konflik)

$port = 5050
$url = "http://localhost:$port/"
$baseDir = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)

try {
    $listener.Start()
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host " 🎮 ALIANSI STORE - Next-Gen Server Berjalan!" -ForegroundColor Green
    Write-Host " Buka browser di: $url" -ForegroundColor Yellow
    Write-Host " Tekan Ctrl+C di jendela ini untuk menghentikan server" -ForegroundColor Gray
    Write-Host "==========================================================" -ForegroundColor Cyan
    
    # Auto-open browser
    Start-Process $url

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # Prevent browser caching so changes appear immediately!
        $response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")
        $response.AddHeader("Pragma", "no-cache")
        $response.AddHeader("Expires", "0")

        $localPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrEmpty($localPath)) {
            $localPath = "index.html"
        }

        # Strip query parameters if any
        if ($localPath.Contains("?")) {
            $localPath = $localPath.Substring(0, $localPath.IndexOf("?"))
        }

        # Handle Netlify Function Mock for Local Server
        if ($localPath -like "*.netlify/functions/duitku-inquiry*" -or $localPath -like "*api/duitku-inquiry*") {
            try {
                $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                $reqBodyStr = $reader.ReadToEnd()
                $reqJson = $reqBodyStr | ConvertFrom-Json

                $mCode = "DS37511"
                $mKey = "af12edbc311afba784bc7c8bd19a2c61"
                $mOrderId = $reqJson.merchantOrderId
                $mAmount = [int]$reqJson.paymentAmount
                $mMethod = if ($reqJson.paymentMethod) { $reqJson.paymentMethod } else { "SP" }
                $mDetails = if ($reqJson.productDetails) { $reqJson.productDetails } else { "Game PS4 Digital" }
                $mEmail = if ($reqJson.email) { $reqJson.email } else { "customer@gmail.com" }
                $mPhone = if ($reqJson.phoneNumber) { $reqJson.phoneNumber } else { "081234567890" }

                # Signature: MD5(merchantCode + merchantOrderId + paymentAmount + apiKey)
                $md5 = [System.Security.Cryptography.MD5]::Create()
                $rawSig = "$mCode$mOrderId$mAmount$mKey"
                $sigBytes = [System.Text.Encoding]::UTF8.GetBytes($rawSig)
                $sig = ($md5.ComputeHash($sigBytes) | ForEach-Object { "{0:x2}" -f $_ }) -join ""

                $duitkuPayload = @{
                    merchantCode = $mCode
                    paymentAmount = $mAmount
                    paymentMethod = $mMethod
                    merchantOrderId = $mOrderId
                    productDetails = $mDetails
                    email = $mEmail
                    phoneNumber = $mPhone
                    callbackUrl = if ($reqJson.callbackUrl) { $reqJson.callbackUrl } else { "https://aliansistore-ps.netlify.app/callback" }
                    returnUrl = if ($reqJson.returnUrl) { $reqJson.returnUrl } else { "https://aliansistore-ps.netlify.app/" }
                    signature = $sig
                    expiryPeriod = 60
                } | ConvertTo-Json -Compress

                $tmp = [System.IO.Path]::GetTempFileName()
                [System.IO.File]::WriteAllText($tmp, $duitkuPayload)
                $duitkuRes = & curl.exe -s -X POST "https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry" -H "Content-Type: application/json" -d "@$tmp"
                Remove-Item $tmp

                $response.ContentType = "application/json; charset=utf-8"
                $response.AddHeader("Access-Control-Allow-Origin", "*")
                $resBytes = [System.Text.Encoding]::UTF8.GetBytes($duitkuRes)
                $response.ContentLength64 = $resBytes.Length
                $response.StatusCode = 200
                $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
            }
            catch {
                $response.StatusCode = 500
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes("{""error"":""$($_.Exception.Message)""}")
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            }
            $response.Close()
            continue
        }

        $filePath = Join-Path $baseDir $localPath

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".htm"  { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".webp" { "image/webp" }
                ".svg"  { "image/svg+xml" }
                ".ico"  { "image/x-icon" }
                Default { "application/octet-stream" }
            }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
        else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $localPath")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }

        $response.Close()
    }
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
finally {
    $listener.Stop()
    $listener.Close()
}
