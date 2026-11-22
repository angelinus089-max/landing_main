param(
    [int]$Port = 5173,
    [string]$DistPath = "$PSScriptRoot\dist"
)

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()
Write-Output "HTTP server started on http://localhost:$Port"

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".mjs"  = "application/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".webp" = "image/webp"
    ".ico"  = "image/x-icon"
    ".json" = "application/json; charset=utf-8"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".ttf"  = "font/ttf"
}

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $stream = $client.GetStream()
            $stream.ReadTimeout = 3000
            $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII)
            $line = $reader.ReadLine()
            if (-not $line) { continue }

            $tokens = $line -split ' '
            if ($tokens.Count -lt 2) { continue }
            $rawPath = $tokens[1]

            $qIdx = $rawPath.IndexOf('?')
            if ($qIdx -ge 0) { $rawPath = $rawPath.Substring(0, $qIdx) }

            $urlPath = $rawPath.TrimStart('/')
            if ([string]::IsNullOrWhiteSpace($urlPath)) { $urlPath = "index.html" }

            $decodedPath = [System.Uri]::UnescapeDataString($urlPath).Replace('/', '\')
            $filePath = Join-Path $DistPath $decodedPath

            if (-not (Test-Path $filePath -PathType Leaf)) {
                $ext = [System.IO.Path]::GetExtension($decodedPath)
                if ([string]::IsNullOrEmpty($ext) -or -not ($mimeTypes.ContainsKey($ext.ToLower()))) {
                    $filePath = Join-Path $DistPath "index.html"
                }
            }

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = "application/octet-stream"
                if ($mimeTypes.ContainsKey($ext)) {
                    $contentType = $mimeTypes[$ext]
                }
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
                $hb = [System.Text.Encoding]::ASCII.GetBytes($header)
                $stream.Write($hb, 0, $hb.Length)
                $stream.Write($bytes, 0, $bytes.Length)
                $stream.Flush()
            } else {
                $nf = "HTTP/1.1 404 Not Found`r`nContent-Length: 0`r`nConnection: close`r`n`r`n"
                $nfb = [System.Text.Encoding]::ASCII.GetBytes($nf)
                $stream.Write($nfb, 0, $nfb.Length)
                $stream.Flush()
            }
        } catch {
        } finally {
            $client.Close()
        }
    }
} finally {
    $listener.Stop()
}
