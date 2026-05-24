Add-Type -AssemblyName System.Web
$root = "C:\Users\Kemal\Desktop\Kemal\WEBSİTE"
$port = 8123
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Output "Server listening on http://localhost:$port/"

$mime = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".json" = "application/json"
}

while ($listener.IsListening) {
    try {
        $ctx = $listener.GetContext()
        $req = $ctx.Request
        $res = $ctx.Response
        $path = [System.Web.HttpUtility]::UrlDecode($req.Url.AbsolutePath)
        if ($path -eq "/" -or $path -eq "") { $path = "/index.html" }
        $file = Join-Path $root $path.TrimStart("/")
        if (Test-Path $file -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($file).ToLower()
            $ct = $mime[$ext]
            if (-not $ct) { $ct = "application/octet-stream" }
            $bytes = [System.IO.File]::ReadAllBytes($file)
            $res.ContentType = $ct
            $res.SendChunked = $true
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            $res.OutputStream.Flush()
        } else {
            $res.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $path")
            $res.OutputStream.Write($msg, 0, $msg.Length)
        }
        $res.Close()
        Write-Output "[$([DateTime]::Now.ToString('HH:mm:ss'))] $($req.HttpMethod) $path -> $($res.StatusCode)"
    } catch {
        Write-Output "Request error: $_"
    }
}
