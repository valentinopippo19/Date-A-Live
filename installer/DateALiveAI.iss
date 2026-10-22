#define MyAppName "Date A Live AI Local"
#define MyAppVersion "3.0.0"
[Setup]
AppId={{7EED7F8D-5C75-4A91-9B2B-DAI000003000}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
DefaultDirName={autopf}\DateALiveAI
DefaultGroupName={#MyAppName}
OutputDir=Output
OutputBaseFilename=DateALiveAI-Setup
Compression=lzma
SolidCompression=yes
[Files]
Source: "..\dist\DateALiveAI\*"; DestDir: "{app}"; Flags: recursesubdirs ignoreversion
[Icons]
Name: "{group}\Date A Live AI"; Filename: "{app}\DateALiveAI.exe"
Name: "{commondesktop}\Date A Live AI"; Filename: "{app}\DateALiveAI.exe"
