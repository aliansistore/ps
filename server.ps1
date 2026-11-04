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
