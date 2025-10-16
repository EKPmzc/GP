param(
  [string]$Output = "MosaicStudioLauncher.exe"
)

$cs = @"
using System;
using System.Diagnostics;
using System.IO;

[assembly: System.Reflection.AssemblyTitle("Mosaic Studio Launcher")]
[assembly: System.Reflection.AssemblyProduct("Mosaic Studio")]

namespace MosaicStudioLauncher
{
    internal static class Program
    {
        private static void Main()
        {
            var working = AppDomain.CurrentDomain.BaseDirectory;
            var info = new ProcessStartInfo("cmd.exe", "/k \"npm start\"")
            {
                WorkingDirectory = working,
                UseShellExecute = false
            };
            Process.Start(info);
        }
    }
}
"@

$source = Join-Path $PSScriptRoot 'Launcher.cs'
Set-Content -Path $source -Value $cs -Encoding UTF8

$csc = Join-Path $env:WINDIR 'Microsoft.NET\Framework\v4.0.30319\csc.exe'
if (-not (Test-Path $csc)) {
  $csc = 'csc.exe'
}
if (-not (Get-Command $csc -ErrorAction SilentlyContinue)) {
  throw "csc.exe not found. Install .NET Framework Developer Pack to compile the launcher."
}
$iconPath = Join-Path $PSScriptRoot 'launcher-icon.ico'
$args = @('/nologo','/target:winexe',"/out:$Output", $source)
if (Test-Path $iconPath) {
  $args += "/win32icon:$iconPath"
}
& $csc @args
Remove-Item $source -Force
Write-Host "Launcher written to $Output"
