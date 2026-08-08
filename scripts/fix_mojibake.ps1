$files = Get-ChildItem -Path frontend/src -Recurse -File | Where-Object { @('.js','.jsx','.ts','.tsx') -contains $_.Extension }
$changedAny = $false
foreach ($f in $files) {
  $text = Get-Content -Raw -Encoding UTF8 $f.FullName
  $pattern = '(?:ðŸ.{1,6}|â.{1,6}|Ã.{1,6}|ï¸.{1,4})'
  $matches = [regex]::Matches($text, $pattern)
  if ($matches.Count -eq 0) { continue }
  $changed = $false
  foreach ($m in $matches) {
    $orig = $m.Value
    if ($orig.Length -lt 2) { continue }
    $bytes = [System.Text.Encoding]::GetEncoding('iso-8859-1').GetBytes($orig)
    $decodedTok = [System.Text.Encoding]::UTF8.GetString($bytes)
    if ($decodedTok -ne $orig) { $text = $text.Replace($orig, $decodedTok); $changed = $true }
  }
  if (-not $changed) { continue }
  Set-Content -Path $f.FullName -Value $text -Encoding UTF8
  Write-Output "Replaced in: $($f.FullName)"
  $changedAny = $true
}
Write-Output 'Replacement pass complete.'
if ($changedAny) {
  git -C frontend add -A
  git -C frontend commit -m "fix(frontend): recover mojibake by replacing decoded sequences"
  git -C frontend push
  git add frontend
  if ((git status --porcelain) -ne '') { git commit -m "chore: update frontend pointer after mojibake fixes"; git push }
} else { Write-Output 'No filesystem changes to commit.' }
