PROMPT $g
SET outfolder=xp

ECHO "*** Compiling TS to single 'xp.js'... ***"
"C:\Program Files (x86)\Microsoft SDKs\TypeScript\1.4\tsc.exe" @files.txt --out %outfolder%\xp.js -t ES5 --declaration

ECHO "*** Copying contents... ***"
XCOPY ..\src\xp\schema\markup.xsd %outfolder%\ /d /y
XCOPY ..\src\xp\style\defaultstyle.css %outfolder%\ /d /y