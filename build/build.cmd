PROMPT $g
SET outfolder=xp

ECHO "*** Compiling TS to single 'xp.js'... ***"
"C:\Program Files (x86)\Microsoft SDKs\TypeScript\1.4\tsc.exe" @files.txt --out %outfolder%\xp.js -t ES5 --declaration

ECHO "*** Copying contents... ***"
MD %outfolder%\schema
COPY ..\src\xp\schema\markup.xsd %outfolder%\schema\ /d /y
MD %outfolder%\style
COPY ..\src\xp\style\defaultstyle.css %outfolder%\style\ /d /y
COPY ..\src\xp\style\xp.css %outfolder%\style\xp.less /d /y
COPY ..\src\xp\style\_variables.less %outfolder%\style\ /d /y
MD %outfolder%\typing
MOVE /y %outfolder%\xp.d.ts %outfolder%\typing\xp.d.ts